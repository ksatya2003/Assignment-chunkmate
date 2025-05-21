Explanation of Changes:Scroll for Sidebar:

I added the overflowY: 'auto' property to the sidebar's style to make the sidebar content scrollable.

The height: '100vh' ensures the sidebar takes up the full height of the viewport, and maxHeight: '60vh' limits the document list height, allowing it to scroll if there are more documents than can fit.

Scrollable Document List:

The document list (docList) has overflowY: 'auto', meaning it will show a scrollbar when there are too many documents.

This prevents the sidebar from expanding beyond the viewport, keeping it within a manageable height.

Result:
The sidebar will be scrollable when there are many documents.

The Upload .md button and documents list will remain at the top of the sidebar, and as more documents are added, they will be scrollable.