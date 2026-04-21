import webview
import os
import sys
import webbrowser

def get_resource_path(relative_path):
    try:
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(".")
    return os.path.join(base_path, relative_path)

MAIN_DOMAIN = "platform.mattedev.com"

class Api:
    def open_external(self, url):
        # Questa riga apre il link nel browser predefinito (Chrome/Edge/ecc.)
        print(f"Apertura nel browser di sistema: {url}")
        webbrowser.open(url)

def start_app():
    api = Api()
    
    # Finestra principale FISSA (non ridimensionabile)
    window = webview.create_window(
        title='MatteDev Platform',
        url='https://platform.mattedev.com/pages/dashboard.html',
        width=1200,
        height=800,
        resizable=False,
        js_api=api
    )

    # JavaScript che intercetta i click esterni
    custom_js = """
    document.addEventListener('click', function(e) {
        var target = e.target.closest('a');
        if (target && target.href) {
            try {
                var url = new URL(target.href);
                // Se NON è il dominio platform, apri nel browser
                if (url.hostname !== 'platform.mattedev.com' && url.protocol.startsWith('http')) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    window.pywebview.api.open_external(target.href);
                }
            } catch (err) {}
        }
    }, true);

    // Disabilita tasto destro per serietà app
    document.addEventListener('contextmenu', function(e) { e.preventDefault(); });
    """

    def init_logic(w):
        w.evaluate_js(custom_js)

    webview.start(
        func=init_logic, 
        args=window,
        private_mode=False, 
        debug=False
    )

if __name__ == "__main__":
    start_app()