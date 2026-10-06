def test_action_item_crud_lifecycle(client):
    # 1. Get first meeting id
    meetings = client.get("/api/meetings").json()
    mid = meetings[0]["id"]

    # 2. Create action item
    new_item = {
        "task": "Test unit action item",
        "assignee": "Tester John",
        "due_date": "Nov 01, 2026",
        "completed": False
    }
    create_res = client.post(f"/api/meetings/{mid}/action-items", json=new_item)
    assert create_res.status_code == 201
    item = create_res.json()
    item_id = item["id"]
    assert item["task"] == "Test unit action item"
    assert item["completed"] is False

    # 3. Update action item (mark completed)
    update_res = client.put(f"/api/action-items/{item_id}", json={"completed": True})
    assert update_res.status_code == 200
    updated_item = update_res.json()
    assert updated_item["completed"] is True

    # 4. List all action items and verify it exists
    all_res = client.get("/api/action-items")
    assert all_res.status_code == 200
    all_items = all_res.json()
    assert any(i["id"] == item_id for i in all_items)

    # 5. Delete action item
    del_res = client.delete(f"/api/action-items/{item_id}")
    assert del_res.status_code == 204

    # 6. Verify it is deleted
    all_res_after = client.get("/api/action-items").json()
    assert not any(i["id"] == item_id for i in all_res_after)


def test_global_search(client):
    search_res = client.get("/api/search?q=roadmap")
    assert search_res.status_code == 200
    search_data = search_res.json()
    assert "transcripts" in search_data
    assert len(search_data["transcripts"]) > 0 or len(search_data["meetings"]) > 0
