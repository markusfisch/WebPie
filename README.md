WebPie
======

WebPie is a pie menu for web pages. Its appearance is very similar to
[PieDock](https://github.com/markusfisch/PieDock).
Image and animation quality do depend heavily on browser and operating
system.

How to use
----------

Place both files somewhere in your web project and add those two lines to
the &lt;head/&gt; element of your web page:

	<script type="text/javascript"
		src="path/to/WebPieIcon.js"></script>
	<script type="text/javascript"
		src="path/to/WebPie.js"></script>

Next you'll have to set up the menu, for example:

	<script type="text/javascript">
	<!--

	var p = new WebPie( {
		icons: [
			new WebPieIcon(
				"path/to/icon.png",
				function(){ alert( "First" ); } ),
			new WebPieIcon(
				"path/to/icon.png",
				function(){ alert( "Second" ); } ),
			new WebPieIcon(
				"path/to/icon.png",
				function(){ alert( "Third" ); } )
			] } );

	p.create();

	-->
	</script>
