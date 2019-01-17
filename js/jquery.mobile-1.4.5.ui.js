(function($){

    var defaults = {
        overlay: true,
        position: 'window',
        dismissible: true,
        transition: 'pop',
        corners: false,
        fullWidth: false
    };

	$.toast = function(){

	};

	$.alert = function(title, text, cb){
		if($.isFunction(text)){
			cb = text;
			text = title;
		}

		var $modal = $('<div class="popup-inner">')
			.append($('<div class="popup-body">').append($('<p>').text(text || '')))
			.append($('<div class="popup-buttons">').append(
				$('<span class="popup-button">确认</span>')
					.one('click', function(){
						cb.call();
					})
			));
		if(title){
			$modal.find('.popup-body').before($('<div class="popup-header">').append($('<div class="popup-title">').text(title)));
		}

		return $.modal($modal, {

		});
	};

	$.modal = function(inner, options){
		var opts = $.extend({}, defaults, options);
		if(opts.position === 'top'){
			opts.position = '.popup-support-top';
			opts.tolerance = '0,0,null,0';
		} else if (opts.position === 'bottom'){
			opts.position = '.popup-support-bottom';
            opts.tolerance = 'null,0,0,0';
		}
		var $modal = $('<div>')
			.html($(inner));
			/*.appendTo($.mobile.activePage);*/

        // Events
        $modal.on({
            'popupcreate': function(){
				if(func(opts.onCreate)){ opts.onCreate.call(); }
            },
            'popupafteropen': function(){
                if(func(opts.onOpen)){ opts.onOpen.call(); }
            },
            'popupbeforeposition': function(){
                if(func(opts.beforePosition)){ opts.beforePosition.call(); }
            },
            'popupafterclose': function(){
                $.destroyModal($modal);
                if (opts.afterclose !== 'undefined' && $.isFunction(opts.afterclose)) {
                    opts.afterclose.call();
                }
            }
        });

		// Create and open
		$modal.popup({
				overlayTheme: opts.overlay ? 'b' : undefined,
				positionTo: opts.position,
				transition: opts.transition,
				dismissible: opts.dismissible,
				corners: opts.corners,
				tolerance: opts.tolerance,
				shadow: false
			});
		if(opts.fullWidth){
            $modal.parent().css({ left: 0, right: 0 });
		}
        $modal.popup('open');

		return $modal;
	};

	$.closeModal = function(modal){
		return $(modal).popup('close');
	};

	$.destroyModal = function(modal){
		$(modal).popup('destroy');
	};

	function func(f){
		return f !== 'undefined' && $.isFunction(f);
	}



})(jQuery);

(function($){

	$(function(){
		$('body').append('<div class="popup-support-top">')
			.append('<div class="popup-support-bottom">');
	});

	var defaults = {
		overlay: true,
		corners: false,
		dismissible: true
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