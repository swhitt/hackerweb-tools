export const CSS = `
/* Deep Link - copy link to comment on click */
.hwt-deep-link {
  cursor: pointer;
  text-decoration: none;
}

.hwt-deep-link:hover {
  text-decoration: underline;
}

/* Toast notification for copy confirmation */
.hwt-toast {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  z-index: 10000;
  animation: hwt-toast-fade 2s ease-in-out forwards;
}

@keyframes hwt-toast-fade {
  0% { opacity: 0; transform: translateX(-50%) translateY(10px); }
  10% { opacity: 1; transform: translateX(-50%) translateY(0); }
  90% { opacity: 1; }
  100% { opacity: 0; }
}
`;
