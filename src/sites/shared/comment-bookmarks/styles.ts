export const CSS = `
/* Comment Bookmarks */

/* Bookmark button on each comment */
.hwt-bookmark-btn {
  display: inline-block;
  cursor: pointer;
  font-size: 1em;
  color: #828282;
  margin-left: 8px;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.hwt-bookmark-btn:hover {
  opacity: 1;
}

.hwt-bookmark-btn.bookmarked {
  color: #ff6600;
  opacity: 1;
}

/* Bookmarked comment highlight */
li[data-bookmarked="true"],
tr.athing[data-bookmarked="true"] {
  background: rgba(255, 102, 0, 0.05);
}

/* ================================================================
   Bookmarks Panel
   ================================================================ */

.hwt-bookmarks-panel {
  position: fixed;
  right: 20px;
  bottom: 80px;
  width: 340px;
  max-height: 480px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12), 0 2px 10px rgba(0, 0, 0, 0.08);
  z-index: 10000;
  display: none;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
}

.hwt-bookmarks-panel.visible {
  display: flex;
  flex-direction: column;
}

/* Header */
.hwt-bookmarks-panel-header {
  padding: 14px 16px;
  border-bottom: 1px solid #eeecea;
  font-weight: 600;
  font-size: 14px;
  color: #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.hwt-bookmarks-panel-close {
  cursor: pointer;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  color: #828282;
  font-size: 18px;
  transition: background 0.15s;
}

.hwt-bookmarks-panel-close:hover {
  background: rgba(0, 0, 0, 0.06);
}

/* Body */
.hwt-bookmarks-panel-body {
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

/* Empty state */
.hwt-bookmarks-empty {
  padding: 32px 16px;
  text-align: center;
  color: #828282;
  font-size: 13px;
}

/* Bookmark item */
.hwt-bookmark-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px 10px 16px;
  border-bottom: 1px solid #eeecea;
  transition: background 0.15s;
}

.hwt-bookmark-item:hover {
  background: rgba(0, 0, 0, 0.03);
}

.hwt-bookmark-item:last-child {
  border-bottom: none;
}

.hwt-bookmark-item-content {
  flex: 1;
  min-width: 0;
  text-decoration: none;
  color: inherit;
}

/* Post title */
.hwt-bookmark-item-title {
  font-size: 12px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Author · time */
.hwt-bookmark-item-meta {
  font-size: 11px;
  color: #828282;
  margin-top: 2px;
}

/* Comment text preview */
.hwt-bookmark-item-text {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-style: italic;
}

.hwt-bookmark-item-content:hover .hwt-bookmark-item-title {
  color: #ff6600;
}

/* Remove button */
.hwt-bookmark-item-remove {
  background: none;
  border: none;
  cursor: pointer;
  color: #ccc;
  font-size: 16px;
  line-height: 1;
  padding: 2px 4px;
  border-radius: 4px;
  flex-shrink: 0;
  margin-top: 1px;
  transition: color 0.15s;
}

.hwt-bookmark-item-remove:hover {
  color: #c00;
}

/* Pagination */
.hwt-bookmarks-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 8px 16px;
  border-top: 1px solid #eeecea;
}

.hwt-bookmarks-nav-btn {
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  color: #333;
  font-size: 18px;
  line-height: 1;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.15s, color 0.15s;
}

.hwt-bookmarks-nav-btn:hover:not(:disabled) {
  border-color: #ff6600;
  color: #ff6600;
}

.hwt-bookmarks-nav-btn:disabled {
  opacity: 0.3;
  cursor: default;
}

.hwt-bookmarks-nav-indicator {
  font-size: 12px;
  color: #828282;
}

/* Toggle FAB */
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

/* ================================================================
   Dark mode
   ================================================================ */

.hwt-dark .hwt-bookmarks-panel {
  background: #1a1a1a;
}

.hwt-dark .hwt-bookmarks-panel-header {
  color: #e0e0e0;
  border-color: #333;
}

.hwt-dark .hwt-bookmarks-panel-close:hover {
  background: rgba(255, 255, 255, 0.1);
}

.hwt-dark .hwt-bookmark-item {
  border-color: #333;
}

.hwt-dark .hwt-bookmark-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.hwt-dark .hwt-bookmark-item-title {
  color: #e0e0e0;
}

.hwt-dark .hwt-bookmark-item-text {
  color: #999;
}

.hwt-dark .hwt-bookmark-item-meta {
  color: #888;
}

.hwt-dark .hwt-bookmark-item-remove {
  color: #555;
}

.hwt-dark .hwt-bookmark-item-remove:hover {
  color: #c00;
}

.hwt-dark .hwt-bookmarks-empty {
  color: #888;
}

.hwt-dark .hwt-bookmarks-nav {
  border-color: #333;
}

.hwt-dark .hwt-bookmarks-nav-btn {
  border-color: #444;
  color: #e0e0e0;
}

.hwt-dark .hwt-bookmarks-nav-btn:hover:not(:disabled) {
  border-color: #ff6600;
  color: #ff6600;
}
`;
