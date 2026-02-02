export const CSS = `
/* Comment Bookmarks */

/* Bookmark button */
.hwt-bookmark-btn {
  display: inline-block;
  cursor: pointer;
  font-size: 12px;
  color: #828282;
  margin-left: 8px;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.hwt-bookmark-btn:hover {
  opacity: 1;
}

/* Bookmarked state */
.hwt-bookmark-btn.bookmarked {
  color: #ff6600;
  opacity: 1;
}

/* Bookmarked comment indicator */
li[data-bookmarked="true"],
tr.athing[data-bookmarked="true"] {
  background: rgba(255, 102, 0, 0.05);
}

/* Bookmarks panel */
.hwt-bookmarks-panel {
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 300px;
  max-height: 400px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 10000;
  display: none;
}

.hwt-bookmarks-panel.visible {
  display: block;
}

.hwt-bookmarks-panel-header {
  padding: 12px 16px;
  border-bottom: 1px solid #ddd;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hwt-bookmarks-panel-close {
  cursor: pointer;
  font-size: 18px;
  color: #828282;
}

.hwt-bookmarks-panel-body {
  max-height: 350px;
  overflow-y: auto;
}

.hwt-bookmark-item {
  padding: 10px 16px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.hwt-bookmark-item:hover {
  background: #f6f6ef;
}

.hwt-bookmark-item:last-child {
  border-bottom: none;
}

.hwt-bookmark-item-text {
  font-size: 13px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hwt-bookmark-item-meta {
  font-size: 11px;
  color: #828282;
  margin-top: 4px;
}

/* Toggle button to show bookmarks */
.hwt-bookmarks-toggle {
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 48px;
  height: 48px;
  background: #ff6600;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hwt-bookmarks-toggle:hover {
  background: #ff7700;
}

.hwt-bookmarks-toggle-count {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #c00;
  color: white;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 10px;
}
`;
