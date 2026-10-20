from pathlib import Path
import re

SOURCE = Path("Zero-The-Legend-ZeroExtens-PRO-ccccc-4.3.txt")
OUTPUT = Path("Zero-The-Legend-localhost.user.js")

# Deve essere il WebSocket del server di gioco locale.
LOCAL_GAME_WS = "ws://localhost:80"


def replace_once(text, old, new, description):
    count = text.count(old)

    if count != 1:
        raise RuntimeError(
            f"Modifica non applicata: {description}. "
            f"Attesa una corrispondenza, trovate {count}."
        )

    return text.replace(old, new, 1)


def main():
    if not SOURCE.is_file():
        raise FileNotFoundError(
            f"File non trovato: {SOURCE.name}. "
            "Mettilo nella stessa cartella di questo programma."
        )

    text = SOURCE.read_text(encoding="utf-8-sig")

    text = replace_once(
        text,
        "// @run-at       document-end",
        (
            "// @match        http://localhost/*\n"
            "// @match        https://localhost/*\n"
            "// @match        http://127.0.0.1/*\n"
            "// @match        https://127.0.0.1/*\n"
            "// @run-at       document-end"
        ),
        "abilitazione sulle pagine localhost",
    )

    text = replace_once(
        text,
        "        agarServer: null,",
        f'        agarServer: "{LOCAL_GAME_WS}",',
        "impostazione del server di gioco locale",
    )

    # Sostituisce il rilevamento automatico dei server esterni.
    # Non intercetta e non modifica i WebSocket della pagina:
    # imposta soltanto la destinazione dei bot su localhost.
    hook_start = text.find("    function hookWebSocket() {")
    hook_end = text.find("\n    function ensureUI() {", hook_start)

    if hook_start == -1 or hook_end == -1:
        raise RuntimeError(
            "Impossibile individuare la funzione hookWebSocket."
        )

    local_hook = f"""    function hookWebSocket() {{
        const localServer = new URL("{LOCAL_GAME_WS}");
        const allowedHosts = new Set([
            "localhost",
            "127.0.0.1",
            "[::1]"
        ]);

        if (!allowedHosts.has(localServer.hostname)) {{
            throw new Error("Sono consentiti soltanto server locali.");
        }}

        if (!["ws:", "wss:"].includes(localServer.protocol)) {{
            throw new Error("Indirizzo WebSocket locale non valido.");
        }}

        botConfig.agarServer = localServer.href;
    }}
"""

    text = text[:hook_start] + local_hook + text[hook_end:]

    old_condition = (
        r'    if (/agar\.io/.test(location.hostname) || '
        r'/delt\.io/.test(location.hostname)) {'
    )

    new_condition = """    if (
        location.hostname === "agar.io" ||
        location.hostname.endsWith(".agar.io") ||
        location.hostname === "delt.io" ||
        location.hostname.endsWith(".delt.io") ||
        location.hostname === "deltav4.gitlab.io" ||
        location.hostname === "localhost" ||
        location.hostname === "127.0.0.1" ||
        location.hostname === "[::1]"
    ) {"""

    text = replace_once(
        text,
        old_condition,
        new_condition,
        "avvio dello script anche su localhost",
    )

    text = replace_once(
        text,
        'showNotice("Join a game first");',
        'showNotice("Server di gioco locale non configurato");',
        "messaggio del server locale",
    )

    # Elimina l'icona remota del userscript.
    text = re.sub(
        r"^// @icon[^\n]*\n",
        "",
        text,
        flags=re.MULTILINE,
    )

    # Rimuove il collegamento promozionale esterno dal pannello.
    text = replace_once(
        text,
        (
            '<a class="gx-brand" '
            'href="https://www.youtube.com/@Scarzbro" '
            'target="_blank" rel="noopener noreferrer">'
            'Zero PRO 4.3</a>'
        ),
        '<span class="gx-brand">Zero PRO Localhost</span>',
        "rimozione del collegamento esterno dal pannello",
    )

    OUTPUT.write_text(text, encoding="utf-8")

    print(f"Creato: {OUTPUT.name}")
    print(f"Destinazione bot: {LOCAL_GAME_WS}")
    print("Il file originale non è stato modificato.")


if __name__ == "__main__":
    try:
        main()
    except (OSError, RuntimeError) as error:
        raise SystemExit(f"Errore: {error}")
