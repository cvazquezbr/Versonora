from playwright.sync_api import sync_playwright, expect
import json

def test_chat_features(page):
    # Mocking APIs
    page.route("**/api/chat/conversations*", lambda route: route.fulfill(
        status=200, content_type="application/json", body=json.dumps([{
            "id": "conv-1", "user_email": "user@example.com", "title": "Conversa 1",
            "last_message": "Olá", "last_message_at": "2023-10-27T10:00:00Z", "unread_count": 1
        }])
    ))
    page.route("**/api/chat/unread-count", lambda route: route.fulfill(status=200, body=json.dumps({"count": 1})))
    page.route("**/api/chat/conversations/conv-1/messages*", lambda route: route.fulfill(
        status=200, content_type="application/json", body=json.dumps([{
            "id": "msg-1", "conversation_id": "conv-1", "sender_id": "other-user",
            "content": "Olá", "created_at": "2023-10-27T10:00:00Z", "is_read": False
        }])
    ))
    page.route("**/api/admin", lambda route: route.fulfill(
        status=200, content_type="application/json", body=json.dumps([
            {"id": "user-2", "email": "client@example.com", "roles": []}
        ])
    ))

    token = "header.eyJ1c2VySWQiOiIxMjM0NTY3OC0xMjM0LTEyMzQtMTIzNC0xMjM0NTY3ODkwMTIiLCJyb2xlcyI6WyJhZG1pbiJdLCJleHAiOjI1MjQ2MDgwMDB9.signature"

    page.goto("http://localhost:3000")
    page.evaluate(f"localStorage.setItem('token', '{token}')")
    page.goto("http://localhost:3000/chat")

    # Click on the conversation (using email because it's admin)
    page.click("text=user@example.com")

    # Wait for ChatWindow
    page.wait_for_selector("h3:has-text('user@example.com')")

    # Check for MoreVertical button
    page.click("button:has(svg.lucide-more-vertical)")

    # Take screenshot of the menu
    page.screenshot(path="verification/chat_window_menu.png")

    # Open New Chat modal
    page.click("text=Nova Conversa")
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
            page.screenshot(path="verification/error_2.png")
        finally:
            browser.close()
