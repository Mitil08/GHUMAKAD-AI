import pytest
from app.repositories.destination_repository import DestinationRepository


def test_destinations_loaded():
    """Verify that destination repository loads the destination records."""
    destinations = DestinationRepository.get_all()
    assert len(destinations) >= 30
    assert any(d.name == "Rishikesh" for d in destinations)
    assert any(d.name == "Goa (North & South)" for d in destinations)


def test_filter_by_state():
    """Verify state filtering."""
    kerala_dests = DestinationRepository.get_all(state="Kerala")
    assert len(kerala_dests) >= 2
    for d in kerala_dests:
        assert d.state.lower() == "kerala"


def test_filter_by_type():
    """Verify destination category filtering."""
    beach_dests = DestinationRepository.get_all(destination_type="beaches")
    assert len(beach_dests) >= 3
    for d in beach_dests:
        assert any("beach" in t.lower() for t in d.destination_types)


def test_search_destinations():
    """Verify text search in title, description, or attractions."""
    search_results = DestinationRepository.get_all(search="rafting")
    assert len(search_results) >= 1
    assert any(d.name == "Rishikesh" for d in search_results)


def test_get_by_id_found():
    """Verify lookup of valid destination id."""
    dest = DestinationRepository.get_by_id("dest_001")
    assert dest is not None
    assert dest.destination_id == "dest_001"
    assert dest.name == "Rishikesh"


def test_get_by_id_not_found():
    """Verify lookup of non-existent id returns None."""
    dest = DestinationRepository.get_by_id("dest_nonexistent_999")
    assert dest is None
