from playwright.sync_api import sync_playwright, expect
import json

def test_chat_features(page):
    # Mocking conversations API
    def handle_conversations(route):
        route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps([
                {
                    "id": "conv-1",
                    "user_email": "user@example.com",
                    "title": "Conversa 1",
                    "last_message": "Olá",
                    "last_message_at": "2023-10-27T10:00:00Z",
                    "unread_count": 1
                }
            ])
        )

    page.route("**/api/chat/conversations*", handle_conversations)
    page.route("**/api/chat/unread-count", lambda route: route.fulfill(status=200, body=json.dumps({"count": 1})))

    # Dummy admin token
    token = "header.eyJ1c2VySWQiOiIxMjM0NTY3OC0xMjM0LTEyMzQtMTIzNC0xMjM0NTY3ODkwMTIiLCJyb2xlcyI6WyJhZG1pbiJdLCJleHAiOjI1MjQ2MDgwMDB9.signature"

    page.goto("http://localhost:3000")
    page.evaluate(f"localStorage.setItem('token', '{token}')")

    page.goto("http://localhost:3000/chat")

    # Wait for the sidebar
    page.wait_for_selector("h2:has-text('Conversas')")

    # Check if filters are visible (Admin)
    expect(page.get_by_role("tab", name="Todas")).to_be_visible()
    expect(page.get_by_role("tab", name="Não lidas")).to_be_visible()
    expect(page.get_by_role("tab", name="Pendente")).to_be_visible()

    # Click on the conversation
    page.click("text=Conversa 1")

    # Check if ChatWindow is visible
    page.wait_for_selector("h3:has-text('user@example.com')") # Admin sees email

    # Check if MoreVertical icon (dropdown) is visible
    page.wait_for_selector("button:has(svg.lucide-more-vertical)")

    # Take screenshot
    page.screenshot(path="verification/chat_admin_view.png")

    print("Screenshot saved to verification/chat_admin_view.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        try:
            test_chat_features(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_mock.png")
        finally:
            browser.close()
