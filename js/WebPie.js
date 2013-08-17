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
"use strict";
(function(){
	/**
	 * Construct a pie menu
	 *
	 * @param properties - property list in JSON format (optional)
	 */
	function WebPie( properties )
	{
		/** Size of a side of the square of the pie menu */
		this.size = 320;

		/** Multiplier of start radius */
		this.startRadius = .75;

		/**
		 * True if you want to WebPie to observe Fitts' Law and make each
		 * pie-slice extend to the edge of the screen
		 */
		this.fitts = false;

		/** Show menu when mouse button is down */
		this.showOnMouseDown = false;

		/** True if this is Internet Explorer */
		this.isIE = document.all && !window.opera ? 1 : 0;

		/** Maximum radius */
		this.maxRadius = 0;

		/** Current radius of pie menu */
		this.radius = 0;

		/** Radial displacement for intro animation */
		this.twist = 0;

		/** Horizontal center of pie menu */
		this.centerX = 0;

		/** Vertical center of pie menu */
		this.centerY = 0;

		/** X coordinate of cursor position within pie menu */
		this.x = 0;

		/** Y coordinate of cursor position within pie menu */
		this.y = 0;

		/** Radians per circle */
		this.radiansPerCircle = Math.PI+Math.PI;

		/** Half PI */
		this.pi2 = Math.PI/2;

		/** Array of WebPieIcon objects */
		this.icons = [];

		/** Timer id */
		this.timerId = 0;

		/** Array index of currently selected icon */
		this.selectedIcon = -1;

		// assign JSON property list
		if( properties )
			this.assignProperties( properties );
	}

	/**
	 * Create menu for given element or document if not given
	 *
	 * @param e - document element (optional)
	 */
	WebPie.prototype.create = function( e )
	{
		if( !e )
			e = document;

		e.webPie = this;

		if( this.showOnMouseDown )
			e.onmousedown = this.showHide;

		e.onmouseup = this.showHide;
	}

	/**
	 * Show/hide pie menu
	 *
	 * @param e - event
	 */
	WebPie.prototype.showHide = function( e )
	{
		var w = this.webPie,
			b = 0;

		if( !w )
			return;

		if( w.isIE )
			b = event.button;
		else
			b = e.which;

		if( w.timerId )
		{
			if( !w.preHide( this ) )
				return false;

			if( w.selectedIcon > -1 &&
				w.selectedIcon < w.icons.length &&
				w.icons[w.selectedIcon].execute( w ) )
				return true;

			w.hide();
			w.postHide( this );

			return true;
		}
		else if( b == 1 )
		{
			if( !w.preShow( this ) )
				return false;

			w.setCursor( e );
			w.show();
			w.postShow( this );

			return true;
		}

		return false;
	}

	/**
	 * Handle mouse moves
	 *
	 * @param e - event
	 */
	WebPie.prototype.mouseMove = function( e )
	{
		var w = this.webPie;

		if( !w )
			return;

		w.setCursor( e );

		if( !w.fitts )
		{
			var x = w.x-w.centerX;
			var y = w.y-w.centerY;

			if( Math.sqrt( (x*x)+(y*y) ) > w.size>>1 )
				w.hide();
		}
	}

	/**
	 * Show menu
	 */
	WebPie.prototype.show = function()
	{
		if( this.timerId )
			return;

		document.webPie = this;

		this.saveOnMouseMove = document.onmousemove;
		document.onmousemove = this.mouseMove;

		this.maxRadius = (this.size-(.3*this.size))>>1;
		this.radius = Math.round( this.startRadius*this.maxRadius );
		this.twist = -.05*((this.maxRadius-this.radius)>>1);
		this.centerX = this.x;
		this.centerY = this.y;

		this.draw();
	}

	/**
	 * Hide menu
	 */
	WebPie.prototype.hide = function()
	{
		document.onmousemove = this.saveOnMouseMove;

		for( var n = this.icons.length; n--; )
			this.icons[n].hide();

		clearTimeout( this.timerId );
		this.timerId = 0;
	}

	/**
	 * Executed before hiding the menu; this is a virtual method
	 *
	 * @param e - event sending document element
	 * @return false to stop the hide, true otherwise
	 */
	WebPie.prototype.preHide = function( e )
	{
		return true;
	}

	/**
	 * Executed after hiding the menu; this is a virtual method
	 *
	 * @param e - event sending document element
	 */
	WebPie.prototype.postHide = function( e )
	{
	}

	/**
	 * Executed before showing the menu; this is a virtual method
	 *
	 * @param e - event sending document element
	 * @return false to stop the hide, true otherwise
	 */
	WebPie.prototype.preShow = function( e )
	{
		return true;
	}

	/**
	 * Executed after showing the menu; this is a virtual method
	 *
	 * @param e - event sending document element
	 */
	WebPie.prototype.postShow = function( e )
	{
	}

	/**
	 * Set cursor position from event
	 *
	 * @param e - some event
	 */
	WebPie.prototype.setCursor = function( e )
	{
		var x = 0,
			y = 0;

		if( window.opera )
		{
			x = e.clientX;
			y = e.clientY;
		}
		else if( this.isIE )
		{
			if( document.documentElement &&
				document.documentElement.scrollTop )
			{
				x = event.clientX+document.documentElement.scrollLeft;
				y = event.clientY+document.documentElement.scrollTop;
			}
			else
			{
				x = event.clientX+document.body.scrollLeft;
				y = event.clientY+document.body.scrollTop;
			}
		}
		else
		{
			x = e.pageX;
			y = e.pageY;
		}

		this.x = x;
		this.y = y;
	}

	/**
	 * Draw menu
	 */
	WebPie.prototype.draw = function()
	{
		var numberOfIcons = this.icons.length,
			closestIcon = 0;

		this.selectedIcon = -1;

		if( !numberOfIcons )
			return;

		// calculate positions and sizes
		{
			var circumference = Math.PI*(this.radius<<1),
				pixelsPerRadian = this.radiansPerCircle/circumference,
				centeredY = this.y-this.centerY,
				centeredX = this.x-this.centerX,
				cursorAngle = Math.atan2( centeredY, centeredX ),
				cellSize = this.radiansPerCircle/numberOfIcons,
				closestAngle = 0,
				weight = 0,
				maxIconSize = .8*this.radius,
				maxWeight;

			// calculate weight of each icon
			{
				var cursorRadius = Math.sqrt(
						(centeredY*centeredY)+
						(centeredX*centeredX) ),
					infieldRadius = this.radius>>1,
					cursorNearCenter = false,
					f = cursorRadius/infieldRadius;

				if( cursorRadius < infieldRadius )
				{
					var b = (circumference/numberOfIcons)*.75;

					if( b < maxIconSize )
						maxIconSize = b+(maxIconSize-b)*f;

					cursorNearCenter = true;
				}

				// determine how close every icon is to the cursor
				{
					var closestDistance = this.radiansPerCircle,
						a = this.twist,
						m = (maxIconSize*pixelsPerRadian)/cellSize;

					maxWeight = this.pi2+Math.pow( Math.PI, m );

					for( var n = 0; n < numberOfIcons; ++n )
					{
						var d = Math.abs(
							this.getAngleDifference( a, cursorAngle ) );

						if( d < closestDistance )
						{
							closestDistance = d;
							closestIcon = n;
							closestAngle = a;
						}

						if( cursorRadius < infieldRadius )
							d *= f;

						this.icons[n].weight =
							this.pi2+Math.pow( Math.PI-d, m );
						weight += this.icons[n].weight;

						if( (a += cellSize) > Math.PI )
							a -= this.radiansPerCircle;
					}

					if( !cursorNearCenter )
						this.selectedIcon = closestIcon;
				}
			}

			// calculate size of icons
			{
				var sizeUnit = circumference/weight;

				for( var n = numberOfIcons; n--; )
					this.icons[n].size =
						this.icons[n].cellSize =
							sizeUnit*this.icons[n].weight;

				// scale icons within cell
				{
					var maxSize = sizeUnit*maxWeight;

					if( maxSize > maxIconSize )
					{
						var f = maxIconSize/maxSize;

						for( var n = numberOfIcons; n--; )
							this.icons[n].size *= f;
					}
				}
			}

			// calculate icon positions
			{
				var difference = this.getAngleDifference(
						cursorAngle, closestAngle ),
					angle = this.getValidAngle(
						cursorAngle-
							(pixelsPerRadian*
								this.icons[closestIcon].cellSize)/cellSize*
							difference );

				// active icon
				this.icons[closestIcon].x =
					this.centerX+
					Math.round(
						this.radius*
						Math.cos( angle ) );
				this.icons[closestIcon].y =
					this.centerY+
					Math.round(
						this.radius*
						Math.sin( angle ) );

				// calculate positions of all other icons
				{
					var leftAngle = angle,
						rightAngle = angle,
						left = closestIcon,
						right = closestIcon,
						previousRight = closestIcon,
						previousLeft = closestIcon;

					for( var n = 0; ; ++n )
					{
						if( (--left) < 0 )
							left = numberOfIcons-1;

						// break here when number of icons is odd
						if( right == left )
							break;

						if( (++right) >= numberOfIcons )
							right = 0;

						leftAngle = this.getValidAngle(
							leftAngle-
								(
									(.5*this.icons[previousLeft].cellSize)+
									(.5*this.icons[left].cellSize)
								)*pixelsPerRadian );

						this.icons[left].x =
							this.centerX+
							Math.round(
								this.radius*
								Math.cos( leftAngle ) );
						this.icons[left].y =
							this.centerY+
							Math.round(
								this.radius*
								Math.sin( leftAngle ) );

						// break here when number of icons is even
						if( left == right )
							break;

						rightAngle = this.getValidAngle(
							rightAngle+
								(
									(.5*this.icons[previousRight].cellSize)+
									(.5*this.icons[right].cellSize)
								)*pixelsPerRadian );

						this.icons[right].x =
							this.centerX+
							Math.round(
								this.radius*
								Math.cos( rightAngle ) );
						this.icons[right].y =
							this.centerY+
							Math.round(
								this.radius*
								Math.sin( rightAngle ) );

						previousRight = right;
						previousLeft = left;
					}
				}
			}
		}

		// draw icons
		for( var n = numberOfIcons; n--; )
		{
			var i = this.icons[n];

			if( !i.div.webPie )
			{
				i.div.webPie = this;
				i.div.onmouseup = this.showHide;
			}

			i.draw();
		}

		// zoom and rotate into appearance
		if( this.radius < this.maxRadius )
		{
			if( (this.radius += 2) > this.maxRadius )
				this.radius = this.maxRadius;

			if( (this.twist += .05) > this.radiansPerCircle )
				this.twist -= this.radiansPerCircle;
		}

		var t = this;
		this.timerId = setTimeout(
			function(){ t.draw(); },
			10 );
	}

	/**
	 * Return the difference of two angles in radians
	 *
	 * @param a - angle in radians
	 * @param b - angle in radians
	 * @return difference of two angles in radians
	 */
	WebPie.prototype.getAngleDifference = function( a, b )
	{
		var c = a-b,
			d;

		if( a > b )
			d = a-(b+this.radiansPerCircle);
		else
			d = a-(b-this.radiansPerCircle);

		if( Math.abs( c ) < Math.abs( d ) )
			return c;

		return d;
	}

	/**
	 * Recalculate angle to be within a valid range
	 *
	 * @param a - angle in radians
	 * @return valid angle
	 */
	WebPie.prototype.getValidAngle = function( a )
	{
		if( a < -Math.PI )
			a += this.radiansPerCircle;
		else if( a > Math.PI )
			a -= this.radiansPerCircle;

		return a;
	}

	/**
	 * Assign JSON properties
	 *
	 * @param properties - property list in JSON format
	 */
	WebPie.prototype.assignProperties = function( properties )
	{
		for( var name in properties )
			this[name] = properties[name];
	}

	window.WebPie = WebPie;
})();
