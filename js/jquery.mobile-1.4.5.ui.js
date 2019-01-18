(function($){

	$(function(){
		$('body').append('<div class="popup-support-top">')
			.append('<div class="popup-support-bottom">');
	});

    var defaults = {
        overlay: true,
        position: 'window',
        offset: 0,
        dismissible: true,
        transition: 'pop',
        corners: false,
        shadow: false,
        fullWidth: false,
        stay: 0
    };

    $.popQueue = []; // popup队列
    $.activePop = undefined;

    /* Toast 暂时没有好的实现方式 */
	/*$.toast = function(text){
		var $inner = $('<div class="popup-inner toast">')
			.append($('<div class="popup-body">').text(text || ''));
		return $.popup($inner, {
			overlay: false,
			dismissible: true,
			stay: 1500,
			position: 'bottom',
			offset: '35'
		});
	};*/

	$.alert = function(title, text, cb){
		if(text === undefined){
			text = title;
			title = undefined;
		}
		if($.isFunction(text)){
			cb = text;
			text = title;
			title = undefined;
		}
		var buttons = [
			{ text: '确认', close: true, onClick: cb }
		];
		var opts = {
			dismissible: false
		};

		return $.modal('alert', title, text, buttons, opts);
	};

	$.confirm = function(title, text, cb){
		if(text === undefined){
			text = title;
			title = undefined;
		}
		if($.isFunction(text)){
			cb = text;
			text = title;
			title = undefined;
		}
		var buttons = [
			{ text: '取消', close: true },
			{ text: '确认', close: true, onClick: cb }
		];
		var opts = {
			dismissible: false
		};
		return $.modal('confirm', title, text, buttons, opts);
	};

	$.loading = function(operate, opts){
		if(!operate || operate === 'show'){
			var $inner = $('<div class="popup-inner loading">')
				.append(
					$('<div class="loading-box">')
						.append('<div class="loading-gift g1">')
						.append('<div class="loading-gift g2">')
						.append('<div class="loading-gift g3">')
				);
			return $.popup($inner, {
				dismissible: false,
				overlay: false,
				position: 'window'
			});
		} else {
			return $.closePopup($('.popup-inner.loading').parents('.ui-popup'));
		}
	};

	$.actions = function(title, buttons){
		if(typeof title === 'object'){
			buttons = title;
			title = undefined;
		}
		var $inner = $('<div class="popup-inner actions">');
		if(title){
			$inner.append($('<div class="popup-header">').append('<div class="popup-title">'+ title +'</div>'));
		}
		var $actions = $('<ul>');
		$.each(buttons, function(i, btn){
			$actions.append(
				$('<li class="popup-close">').text(btn.text).on('click', btn.onClick)
			);
		});
		$actions.append($('<li class="popup-close actions-cancel">').text('取消'));
		$inner.append($('<div class="popup-body">').append($actions));
		
		return $.popup($inner, {
			dismissible: true,
			position: 'bottom',
			fullWidth: true,
			transition: 'slideup'
		});
	};

	$.floatMenus = function(title, options){
		if(typeof title === 'object'){
			options = title;
			title = undefined;
		}
		var $inner = $('<div class="popup-inner float-menus">');
		if(title){
			$inner.append($('<div class="popup-header">').append('<div class="popup-title">'+ title +'</div>'));
		}
		var $actions = $('<ul>');
		$.each(options.buttons, function(i, btn){
			$actions.append(
				$('<li class="popup-close"></li>').append(
					$('<a href="javascript:;" class="link"></a>').text(btn.text).on('click', btn.onClick)
				)
			);
		});
		$inner.append($('<div class="popup-body no-padding">').append($actions));
		
		return $.popup($inner, {
			dismissible: true,
			position: options.position,
			fullWidth: false,
			transition: 'none',
			arrow: 'b,t'
		});
	};

	// 通用modal
	$.modal = function(type, title, body, buttons, options){
		options = options || {};
		var $inner = $('<div class="popup-inner '+ (type || '') +'">');
		if(type === 'confirm'){
			$inner.addClass('popup-info');
		}
		if(title){
			$inner.append($('<div class="popup-header"><div class="popup-title">'+ title +'</div></div>'));
		}
		$inner.append($('<div class="popup-body">').html(body));
		if(buttons && buttons.length > 0){
			var $buttons = $('<div class="popup-buttons">');
			$.each(buttons, function(i, btn){
				$buttons.append(
					$('<span>').text(btn.text)
						.addClass(btn.close ? 'popup-button popup-close' : 'popup-button')
						.one('click', btn.onClick)
				);
			});
			$inner.append($buttons);
		}
		return $.popup($inner, options);
	};

	$.popup = function(inner, options){
		var opts = $.extend({}, defaults, options);
		if(opts.position === 'top'){
			opts.position = '.popup-support-top';
			opts.tolerance = '0,'+ opts.offset +',null,0';
		} else if (opts.position === 'bottom'){
			opts.position = '.popup-support-bottom';
            opts.tolerance = 'null,0,'+ opts.offset +',0';
		}
		var $popup = $('<div>').append($(inner));

        // Events
        $popup.on({
            'popupcreate': function(e, ui){
            	lockScreen();
				if(func(opts.onCreate)){ opts.onCreate($popup); }
            },
            'popupafteropen': function(){
                if(func(opts.onOpen)){ opts.onOpen($popup); }
            },
            'popupbeforeposition': function(){
                if(func(opts.beforePosition)){ opts.beforePosition($popup); }
            },
            'popupafterclose': function(){
            	unlockScreen();
            	$.activePop = undefined;
                $.destroyPopup($popup);
                if (func(opts.afterclose)) { opts.afterclose($popup); }

                if($.popQueue.length){
                	$.popQueue.shift()();
                }
            }
        });

        // Create and open
		$popup.popup({
			overlayTheme: opts.overlay ? 'b' : undefined,
			positionTo: opts.position,
			transition: opts.transition,
			dismissible: opts.dismissible,
			corners: opts.corners,
			tolerance: opts.tolerance,
			shadow: opts.shadow,
			arrow: opts.arrow
		});
		if(opts.fullWidth){
            $popup.parent().css({ left: 0, right: 0 });
		}
        $popup.find('.popup-close').on('click', function(){
        	$.closePopup($popup);
        });
        
        $.popQueue.push(function(){ return $.openPopup($popup, opts); });
        if(!$.activePop){ return $.popQueue.shift()(); }
        return $popup;
	};

	$.openPopup = function(popup){
		$.activePop = $(popup);
		return $(popup).popup('open');
	}

	$.closePopup = function(popup){
		return  $(popup).popup('close');
	};

	$.destroyPopup = function(popup){
		return $(popup).popup('destroy');
	};

	function lockScreen(){
		$('body').css('overflowY', 'hidden');
	}

	function unlockScreen(){
		$('body').css('overflowY', 'auto');
	}

	function func(f){
		return f !== undefined && $.isFunction(f);
	}

})(jQuery);