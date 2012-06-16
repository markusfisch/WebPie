/*
 *   O         ,-
 *  ° o    . -´  '     ,-
 *   °  .´        ` . ´,´
 *     ( °   ))     . (
 *      `-;_    . -´ `.`.
 *          `._'       ´
 *
 * Copyright (c) 2007 Markus Fisch <mf@markusfisch.de>
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 */
(function(){
	/**
	 * A menu item
	 *
	 * @param imageUrl - url to icon image
	 * @param action - function to invoke on a click (optional)
	 */
	function WebPieIcon( imageUrl, action )
	{
		/** X position of icon */
		this.x = 0;

		/** Y position of icon */
		this.y = 0;

		/** Weight */
		this.weight = 0;

		/** Length of a side in pixels */
		this.size = 0;

		/** Cell size in pixels */
		this.cellSize = 0;

		/** Callback function */
		this.action = action;

		/** Image element */
		this.image = null;

		/** Document division */
		this.div = null;

		// create icon, do this in a method to make subclassing easy
		this.createIcon( imageUrl );
	}

	/**
	 * Execute icon
	 *
	 * @param webPie - web pie object
	 */
	WebPieIcon.prototype.execute = function( webPie )
	{
		if( !this.action )
			return false;

		return this.action( webPie );
	}

	/**
	 * Draw icon
	 */
	WebPieIcon.prototype.draw = function()
	{
		var size = Math.round( this.size )>>1<<1;
		var x = this.x-(size>>1);
		var y = this.y-(size>>1);

		this.image.style.width = size+"px";
		this.image.style.height = size+"px";

		this.div.style.left = Math.round( x )+"px";
		this.div.style.top = Math.round( y )+"px";
		this.div.style.width = size+"px";
		this.div.style.height = size+"px";
		this.div.style.visibility = "visible";
	}

	/**
	 * Hide icon
	 */
	WebPieIcon.prototype.hide = function()
	{
		this.div.style.visibility = 'hidden';
	}

	/**
	 * Create icon
	 *
	 * @param imageUrl - url to icon image
	 */
	WebPieIcon.prototype.createIcon = function( imageUrl )
	{
		var n = document.getElementsByTagName( "div" ).length;

		var i = document.createElement( "img" );
		i.id = "WebPieIconImage"+n;
		i.src = imageUrl;

		var d = document.createElement( "div" );
		d.id = "WebPieIconObject"+n;
		d.style.position = "absolute";
		d.style.left = "0px";
		d.style.top = "0px";
		d.style.visibility = "hidden";
		d.appendChild( i );

		// add to body
		{
			var b = document.getElementsByTagName( "body" );

			if( !b ||
				!b.length )
				return;

			b[0].appendChild( d );
		}

		this.div = d;
		this.image = i;
	}

	window.WebPieIcon = WebPieIcon;
})();
