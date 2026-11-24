"""
Execute este script sempre que editar js/data.js ou js/app.js.
Ele regenera o index.html com o JavaScript embutido.
"""
import os, re

ROOT = os.path.dirname(os.path.abspath(__file__))

def read(rel):
    with open(os.path.join(ROOT, rel), encoding="utf-8") as f:
        return f.read()

data_js = read("js/data.js")
app_js  = read("js/app.js")
current = read("index.html")

# Remove existing inline <script> blocks and external script tags
clean = re.sub(r'\s*<script>.*?</script>', '', current, flags=re.DOTALL)
clean = re.sub(r'\s*<script src="[^"]*"></script>', '', clean)
clean = clean.replace('</body>', '').replace('</html>', '').rstrip()

result = (
    clean
    + "\n\n<!-- DATA (edite js/data.js e rode atualizar.py) -->\n<script>\n"
    + data_js
    + "\n</script>\n\n<!-- APP (edite js/app.js e rode atualizar.py) -->\n<script>\n"
    + app_js
    + "\n</script>\n</body>\n</html>\n"
)

out = os.path.join(ROOT, "index.html")
with open(out, "w", encoding="utf-8") as f:
    f.write(result)

print(f"index.html atualizado ({os.path.getsize(out)/1024:.0f} KB). Recarregue no navegador.")
