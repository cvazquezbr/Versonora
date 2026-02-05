from playwright.sync_api import sync_playwright, expect
import json

def test_chat_features(page):
    # Mocking APIs
    page.route("**/api/chat/conversations*", lambda route: route.fulfill(status=200, body=json.dumps([])))
    page.route("**/api/chat/unread-count", lambda route: route.fulfill(status=200, body=json.dumps({"count": 0})))
    page.route("**/api/admin", lambda route: route.fulfill(
        status=200, content_type="application/json", body=json.dumps([
            {"id": "user-2", "email": "client@example.com", "roles": []}
        ])
    ))

    token = "header.eyJ1c2VySWQiOiIxMjM0NTY3OC0xMjM0LTEyMzQtMTIzNC0xMjM0NTY3ODkwMTIiLCJyb2xlcyI6WyJhZG1pbiJdLCJleHAiOjI1MjQ2MDgwMDB9.signature"

    page.goto("http://localhost:3000")
    page.evaluate(f"localStorage.setItem('token', '{token}')")
    page.goto("http://localhost:3000/chat")

    page.wait_for_selector("text=Nova Conversa")
    page.click("text=Nova Conversa")

    # Wait for modal
    page.wait_for_selector("text=Iniciar conversa com usuário")

    # Take screenshot of the modal
    page.screenshot(path="verification/chat_new_modal.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        try:
            test_chat_features(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_3.png")
        finally:
            browser.close()
