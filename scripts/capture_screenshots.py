from pathlib import Path
from playwright.sync_api import sync_playwright

url = 'http://127.0.0.1:5173'
out = Path('/tmp/mimoops-screenshots')
out.mkdir(parents=True, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=True,
        executable_path='/root/.cloakbrowser/chromium-146.0.7680.177.3/chrome',
        args=['--no-sandbox'],
    )

    desktop = browser.new_page(viewport={"width": 1440, "height": 1200}, device_scale_factor=1)
    desktop.goto(url, wait_until='networkidle')
    desktop.screenshot(path=str(out / 'mimoops-desktop-full.png'), full_page=True)
    desktop.screenshot(path=str(out / 'mimoops-desktop-hero.png'), full_page=False)

    mobile = browser.new_page(viewport={"width": 390, "height": 1200}, is_mobile=True, device_scale_factor=2)
    mobile.goto(url, wait_until='networkidle')
    mobile.screenshot(path=str(out / 'mimoops-mobile-full.png'), full_page=True)

    browser.close()

print(out / 'mimoops-desktop-full.png')
print(out / 'mimoops-desktop-hero.png')
print(out / 'mimoops-mobile-full.png')
