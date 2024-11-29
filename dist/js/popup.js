(()=>{"use strict";const e=document.getElementById("downloadData"),t=document.getElementById("output"),n=document.getElementById("clearCache"),o=document.getElementById("userId");chrome.storage.local.get(["userId"],(e=>{e.userId&&(o.value=e.userId)})),o.addEventListener("change",(()=>{const e=o.value.trim();chrome.storage.local.set({userId:e},(()=>{t.textContent="User ID saved."}))})),e.addEventListener("click",(()=>{try{const e=o.value.trim();chrome.runtime.sendMessage({action:"downloadData",userId:e},(e=>{e.success?t.textContent="Data downloaded successfully.":t.textContent=`Failed to download data: ${e.error||"Unknown error"}`}))}catch(e){t.textContent=`Error: ${e.message}`}})),n.addEventListener("click",(()=>{try{chrome.storage.local.remove(["orderDetails","htmlSnapshots","interactions","screenshots"]),chrome.runtime.sendMessage({action:"clearMemoryCache"},(()=>{t.textContent="Cache cleared successfully."}))}catch(e){t.textContent=`Error: ${e.message}`}}))})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wdXAuanMiLCJtYXBwaW5ncyI6Im1CQUNBLE1BQU1BLEVBQWtCQyxTQUFTQyxlQUFlLGdCQUMxQ0MsRUFBWUYsU0FBU0MsZUFBZSxVQUNwQ0UsRUFBZ0JILFNBQVNDLGVBQWUsY0FDeENHLEVBQWNKLFNBQVNDLGVBQWUsVUFFNUNJLE9BQU9DLFFBQVFDLE1BQU1DLElBQUksQ0FBQyxXQUFZQyxJQUM5QkEsRUFBT0MsU0FDUE4sRUFBWU8sTUFBUUYsRUFBT0MsT0FDL0IsSUFHSk4sRUFBWVEsaUJBQWlCLFVBQVUsS0FDbkMsTUFBTUYsRUFBU04sRUFBWU8sTUFBTUUsT0FDakNSLE9BQU9DLFFBQVFDLE1BQU1PLElBQUksQ0FBRUosT0FBUUEsSUFBVSxLQUN6Q1IsRUFBVWEsWUFBYyxnQkFBZ0IsR0FDMUMsSUFFTmhCLEVBQWdCYSxpQkFBaUIsU0FBUyxLQUN0QyxJQUNJLE1BQU1GLEVBQVNOLEVBQVlPLE1BQU1FLE9BQ2pDUixPQUFPVyxRQUFRQyxZQUFZLENBQUVDLE9BQVEsZUFBZ0JSLFdBQVdTLElBQ3hEQSxFQUFTQyxRQUNUbEIsRUFBVWEsWUFBYyxnQ0FHeEJiLEVBQVVhLFlBQWMsNEJBQTRCSSxFQUFTRSxPQUFTLGlCQUMxRSxHQUVSLENBQ0EsTUFBT0EsR0FDSG5CLEVBQVVhLFlBQWMsVUFBVU0sRUFBTUMsU0FDNUMsS0FFSm5CLEVBQWNTLGlCQUFpQixTQUFTLEtBQ3BDLElBQ0lQLE9BQU9DLFFBQVFDLE1BQU1nQixPQUFPLENBQUMsZUFBZ0IsZ0JBQWlCLGVBQWdCLGdCQUM5RWxCLE9BQU9XLFFBQVFDLFlBQVksQ0FBRUMsT0FBUSxxQkFBc0IsS0FDdkRoQixFQUFVYSxZQUFjLDZCQUE2QixHQUU3RCxDQUNBLE1BQU9NLEdBQ0huQixFQUFVYSxZQUFjLFVBQVVNLEVBQU1DLFNBQzVDLEkiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9jaHJvbWUtZXh0ZW5zaW9uLXR5cGVzY3JpcHQtc3RhcnRlci8uL3NyYy9wb3B1cC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbmNvbnN0IGRvd25sb2FkRGF0YUJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkb3dubG9hZERhdGEnKTtcbmNvbnN0IG91dHB1dERpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdvdXRwdXQnKTtcbmNvbnN0IGNsZWFyQ2FjaGVCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2xlYXJDYWNoZScpO1xuY29uc3QgdXNlcklkSW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndXNlcklkJyk7XG4vLyDliqDovb3kv53lrZjnmoTnlKjmiLdJRFxuY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0KFsndXNlcklkJ10sIChyZXN1bHQpID0+IHtcbiAgICBpZiAocmVzdWx0LnVzZXJJZCkge1xuICAgICAgICB1c2VySWRJbnB1dC52YWx1ZSA9IHJlc3VsdC51c2VySWQ7XG4gICAgfVxufSk7XG4vLyDnm5HlkKzovpPlhaXlj5jljJblubbkv53lrZhcbnVzZXJJZElucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IHtcbiAgICBjb25zdCB1c2VySWQgPSB1c2VySWRJbnB1dC52YWx1ZS50cmltKCk7XG4gICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHsgdXNlcklkOiB1c2VySWQgfSwgKCkgPT4ge1xuICAgICAgICBvdXRwdXREaXYudGV4dENvbnRlbnQgPSAnVXNlciBJRCBzYXZlZC4nO1xuICAgIH0pO1xufSk7XG5kb3dubG9hZERhdGFCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgdXNlcklkID0gdXNlcklkSW5wdXQudmFsdWUudHJpbSgpO1xuICAgICAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7IGFjdGlvbjogJ2Rvd25sb2FkRGF0YScsIHVzZXJJZCB9LCAocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgIGlmIChyZXNwb25zZS5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgb3V0cHV0RGl2LnRleHRDb250ZW50ID0gJ0RhdGEgZG93bmxvYWRlZCBzdWNjZXNzZnVsbHkuJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIG91dHB1dERpdi50ZXh0Q29udGVudCA9IGBGYWlsZWQgdG8gZG93bmxvYWQgZGF0YTogJHtyZXNwb25zZS5lcnJvciB8fCAnVW5rbm93biBlcnJvcid9YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICBvdXRwdXREaXYudGV4dENvbnRlbnQgPSBgRXJyb3I6ICR7ZXJyb3IubWVzc2FnZX1gO1xuICAgIH1cbn0pO1xuY2xlYXJDYWNoZUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICB0cnkge1xuICAgICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5yZW1vdmUoWydvcmRlckRldGFpbHMnLCAnaHRtbFNuYXBzaG90cycsICdpbnRlcmFjdGlvbnMnLCAnc2NyZWVuc2hvdHMnXSk7XG4gICAgICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHsgYWN0aW9uOiAnY2xlYXJNZW1vcnlDYWNoZScgfSwgKCkgPT4ge1xuICAgICAgICAgICAgb3V0cHV0RGl2LnRleHRDb250ZW50ID0gJ0NhY2hlIGNsZWFyZWQgc3VjY2Vzc2Z1bGx5Lic7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgb3V0cHV0RGl2LnRleHRDb250ZW50ID0gYEVycm9yOiAke2Vycm9yLm1lc3NhZ2V9YDtcbiAgICB9XG59KTtcbiJdLCJuYW1lcyI6WyJkb3dubG9hZERhdGFCdG4iLCJkb2N1bWVudCIsImdldEVsZW1lbnRCeUlkIiwib3V0cHV0RGl2IiwiY2xlYXJDYWNoZUJ0biIsInVzZXJJZElucHV0IiwiY2hyb21lIiwic3RvcmFnZSIsImxvY2FsIiwiZ2V0IiwicmVzdWx0IiwidXNlcklkIiwidmFsdWUiLCJhZGRFdmVudExpc3RlbmVyIiwidHJpbSIsInNldCIsInRleHRDb250ZW50IiwicnVudGltZSIsInNlbmRNZXNzYWdlIiwiYWN0aW9uIiwicmVzcG9uc2UiLCJzdWNjZXNzIiwiZXJyb3IiLCJtZXNzYWdlIiwicmVtb3ZlIl0sInNvdXJjZVJvb3QiOiIifQ==