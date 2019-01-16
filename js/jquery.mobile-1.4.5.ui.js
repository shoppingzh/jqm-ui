(function($){

	$(function(){
		$('body').append('<div class="popup-support-top">')
			.append('<div class="popup-support-bottom">');
	});

	var defaults = {
		overlay: true,
		corners: false,
		dismissible: false
	};

	var methods = {
		_flyup: function(options){
			var opts = $.extend({}, defaults, options);
			var $popup = createPopupWrapper();
			$popup.append(this.show())
				.appendTo($.mobile.activePage)
				.popup({
					overlayTheme: opts.overlay ? 'b' : undefined,
					positionTo: '.popup-support-bottom',
					dismissible: opts.dismissible,
					transition: 'slideup',
					corners: opts.corners,
					tolerance: '0,0,0,0'
				})
				.parent().css('left', '0').css('right', '0')
				.end()
				.popup('open')
				.on('popupafterclose', function(){
					// $(this).popup('destroy').remove();
				});
			return this;
		},
		_flydown: function(options){
			var opts = $.extend({}, defaults, options);
			var $popup = createPopupWrapper();
			$popup.append(this.show())
				.appendTo($.mobile.activePage)
				.popup({
					overlayTheme: opts.overlay ? 'b' : undefined,
					positionTo: '.popup-support-top',
					dismissible: opts.dismissible,
					transition: 'slidedown',
					corners: opts.corners,
					tolerance: '0,0,0,0'
				})
				.parent().css('left', '0').css('right', '0')
				.end()
				.popup('open')
				.on('popupafterclose', function(){
					
				});
			return this;
		}
	};

	function createPopupWrapper(){
		return $('<div data-role="popup">');
	}

	$.fn.extend({
		'flyup': function(options){
			if(this.length > 1){
				throw new Error('每次只能弹出一个!');
			}
			return methods._flyup.apply(this, arguments);
		},
		'flydown': function(options){
			if(this.length > 1){
				throw new Error('每次只能弹出一个!');
			}
			return methods._flydown.apply(this, arguments);
		}
	});

})(jQuery);