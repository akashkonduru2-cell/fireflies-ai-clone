def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"


def test_get_meetings(client):
    response = client.get("/api/meetings")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 6
    first_meeting = data[0]
    assert "title" in first_meeting
    assert "participants" in first_meeting
    assert "transcript_segments_count" in first_meeting
    assert "action_items_count" in first_meeting


def test_search_meetings_by_title(client):
    response = client.get("/api/meetings?search=Product")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any("Product" in m["title"] for m in data)


def test_search_meetings_by_participant(client):
    response = client.get("/api/meetings?search=Sarah")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(any("Sarah" in p["name"] for p in m["participants"]) for m in data)


def test_sort_meetings(client):
    response = client.get("/api/meetings?sort=longest")
    assert response.status_code == 200
    data = response.json()
    durations = [m["duration"] for m in data]
    assert durations == sorted(durations, reverse=True)


def test_get_meeting_detail(client):
    # Fetch first meeting with segments
    list_resp = client.get("/api/meetings")
    meetings = list_resp.json()
    first_with_segments = next(m for m in meetings if m["transcript_segments_count"] > 0)
    target_id = first_with_segments["id"]

    detail_resp = client.get(f"/api/meetings/{target_id}")
    assert detail_resp.status_code == 200
    detail = detail_resp.json()
    assert detail["id"] == target_id
    assert len(detail["transcript_segments"]) >= 10
    assert detail["summary"] is not None
    assert len(detail["summary"]["key_takeaways"]) > 0
    assert len(detail["action_items"]) > 0


def test_create_meeting_with_raw_transcript(client):
    new_meeting_payload = {
        "title": "Architecture Review & Scalability",
        "duration": 2400,
        "participants": ["Alice Cooper", "Bob Smith"],
        "transcript_raw": "Alice|00:10|Welcome Bob, let us review the microservice architecture.\nBob|00:25|Thanks Alice, the database bottleneck is resolved.",
        "summary_overview": "Discussed microservice decoupling and query optimizations.",
        "summary_takeaways": ["Decouple auth service", "Scale read replicas"],
        "topics": ["Architecture", "Database", "Scalability"],
        "action_items": [
            {
                "task": "Review connection pool parameters",
                "assignee": "Bob Smith",
                "due_date": "Oct 25, 2026",
                "completed": False
            }
        ]
    }
    response = client.post("/api/meetings", json=new_meeting_payload)
    assert response.status_code == 201
    created = response.json()
    assert created["title"] == "Architecture Review & Scalability"
    assert len(created["participants"]) == 2
    assert len(created["transcript_segments"]) == 2
    assert created["transcript_segments"][0]["speaker"] == "Alice"
    assert created["transcript_segments"][0]["start_time"] == 10.0
    assert created["summary"]["overview"] == "Discussed microservice decoupling and query optimizations."
    assert len(created["action_items"]) == 1


def test_update_meeting_metadata(client):
    # Create meeting to update
    payload = {"title": "Pre-Update Meeting", "duration": 1800, "participants": ["User A"]}
    res = client.post("/api/meetings", json=payload)
    mid = res.json()["id"]

    # Update title and participants
    update_payload = {"title": "Post-Update Meeting", "participants": ["User A", "User B"]}
    up_res = client.put(f"/api/meetings/{mid}", json=update_payload)
    assert up_res.status_code == 200
    updated = up_res.json()
    assert updated["title"] == "Post-Update Meeting"
    assert len(updated["participants"]) == 2


def test_delete_meeting_and_cascade(client):
    # Create meeting
    payload = {
        "title": "Meeting to Delete",
        "duration": 1200,
        "participants": ["Delete User"],
        "transcript_raw": "Delete User|00:05|This meeting will be deleted."
    }
    create_res = client.post("/api/meetings", json=payload)
    mid = create_res.json()["id"]

    # Delete
    del_res = client.delete(f"/api/meetings/{mid}")
    assert del_res.status_code == 204

    # Verify not found
    get_res = client.get(f"/api/meetings/{mid}")
    assert get_res.status_code == 404


def test_edit_transcript_segment_and_persistence(client):
    # 1. Fetch meeting with transcript segments
    meetings = client.get("/api/meetings").json()
    target_meeting = next(m for m in meetings if m["transcript_segments_count"] > 0)
    mid = target_meeting["id"]

    # 2. Fetch transcript segments
    detail = client.get(f"/api/meetings/{mid}").json()
    first_seg = detail["transcript_segments"][0]
    seg_id = first_seg["id"]
    original_text = first_seg["text"]

    # 3. Edit transcript line via PATCH
    updated_text = "Updated: " + original_text
    patch_res = client.patch(
        f"/api/meetings/{mid}/transcript/{seg_id}",
        json={"text": updated_text}
    )
    assert patch_res.status_code == 200
    updated_data = patch_res.json()
    assert updated_data["id"] == seg_id
    assert updated_data["text"] == updated_text

    # 4. Re-fetch meeting detail to verify SQLite persistence
    detail_after = client.get(f"/api/meetings/{mid}").json()
    seg_after = next(s for s in detail_after["transcript_segments"] if s["id"] == seg_id)
    assert seg_after["text"] == updated_text


def test_edit_multiple_transcript_segments_independently(client):
    # Fetch meeting with at least 2 segments
    meetings = client.get("/api/meetings").json()
    target_meeting = next(m for m in meetings if m["transcript_segments_count"] >= 2)
    mid = target_meeting["id"]
    detail = client.get(f"/api/meetings/{mid}").json()
    seg1 = detail["transcript_segments"][0]
    seg2 = detail["transcript_segments"][1]

    # Edit line 1
    new_text_1 = "Line 1 custom edit verified."
    patch1 = client.patch(f"/api/meetings/{mid}/transcript/{seg1['id']}", json={"text": new_text_1})
    assert patch1.status_code == 200

    # Edit line 2
    new_text_2 = "Line 2 independent edit verified."
    patch2 = client.patch(f"/api/meetings/{mid}/transcript/{seg2['id']}", json={"text": new_text_2})
    assert patch2.status_code == 200

    # Verify both changes persisted without overwriting each other
    detail_after = client.get(f"/api/meetings/{mid}").json()
    seg1_after = next(s for s in detail_after["transcript_segments"] if s["id"] == seg1["id"])
    seg2_after = next(s for s in detail_after["transcript_segments"] if s["id"] == seg2["id"])

    assert seg1_after["text"] == new_text_1
    assert seg2_after["text"] == new_text_2
