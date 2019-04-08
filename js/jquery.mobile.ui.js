
/*
 * ==============================================
 *              Selectable List
 * ==============================================
 */
(function($){

    $(document).on('click', '.select-list .select-item', function(){
        var $list = $(this).parents('.select-list');
        if($list.hasClass('multiple')){
            $(this).toggleClass('selected');
        }else{
            $(this).addClass('selected').siblings('.select-item').removeClass('selected');
        }
    });


    $.fn.selectList = function(m, options){
        if(methods[m]){
            return methods[m].apply(this, Array.prototype.slice.call(arguments, 1));
        }else if(typeof m === 'object' || !m){
            return methods.init.apply(this, arguments);
        }else{
            throw new Error('没有找到' + m + '方法！');
        }
    };

    var methods = {
        init: function(options){
            var opts = $.extend({}, $.fn.selectList.defaults, options);
            return this.each(function(){
                var $list = $(this);
                if(!$list.hasClass('select-list')){
                    $list.addClass('select-list');
                }
                $list.find('li').each(function () {
                    var $li = $(this);
                    if(!$li.hasClass('select-item')){
                        $li.addClass('select-item');
                    }
                });
                if(opts.multiple){
                    $list.addClass('multiple');
                }else{
                    $list.removeClass('multiple');
                }
            });
        },
        getResult: function(){
           var $list = $(this);
           var result = [];
           $list.find('.select-item').each(function () {
               if($(this).hasClass('selected')){
                   result.push($(this).index());
               }
           });
           return result;
        }
    };

    $.fn.selectList.defaults = {
        multiple: false
    };



})(jQuery);

/* 
 * ==============================================
 *                    Picker
 * ==============================================
 */
 (function($){

 	/*
	 * multiple(Boolean): 是否可多选，默认单选
 	 */
 	var defaults = {
 		multiple: false
 	};

 	$.fn.picker = function(options){
 		var opts = $.extend({}, defaults, options);
 		return this.each(function(){
 			var $this = $(this);
 			if($this.hasClass('ui-listview') && !$this.hasClass('ui-selector')){
 				$this.addClass('ui-selector')
 				if(opts.multiple){
 					$this.addClass('multiple');
 				}
 				
 				$this.find('li').addClass('ui-selector-item')
 					.append('<div class="ui-selector-icon">')
 					.on('click', function(){
 						if(opts.multiple){
 							$(this).toggleClass('selected');
 						}else{
 							$(this).addClass('selected')
 								.siblings('.ui-selector-item').removeClass('selected');
 						}
 					});
 			}
 		});
 	};

 	$.fn.getPickResult = function(){
 		var r = [];
 		$(this).find('.ui-selector-item.selected').each(function(){
 			var $item = $(this);
 			r.push({
 				index: $item.index(),
 				html: $item.html(),
 				content: $item.text()
 			});
 		});

 		return r;
 	};



 })(jQuery);

/* 
 * ==============================================
 *                    Forms
 * ==============================================
 */
;(function($){

    $(function(){
    	var $form = $('.ui-form');

		// focus
        $form.on('focus blur', 'input, textarea, select', function(){
			$(this).toggleFocus();
		});

		// clear
        $form.on('keyup input propertychange', 'input, textarea', function(){
			$(this).toggleClear();
		});
        $form.on('click', '.input-clear', function(){
			$(this).siblings('input,textarea').val('').toggleClear().focus();
		});

        // select with popup

        $('select.popup-select').each(function(){
            var $select = $(this);
            $select.hide();
            var text = $select.find(':selected').text();
            var $span = $('<span>').text(text || '请选择');
            if(!$select.find(':selected').val()){
                $span.addClass('placeholder');
            }
            $select.wrap('<div class="popup-select-block">').before($span);
        });

        $('.popup-select-trigger:has(".popup-select-block")').on('click', function(){
            var $c = $(this);
            $c.find('select.popup-select').popupMenu().on('change', function(){
                var $opt = $(this).find(':selected');
                $c.find('.popup-select-block>span').text($opt.text());
                if($opt.val()){
                    $c.find('span').removeClass('placeholder');
                }
            });
		});

		// Popup select
		$.fn.popupMenu = function(options){
			return this.each(function(){
				var $select = $(this);
				var items = [];
				$select.find('option').each(function(){
					var $opt = $(this);
					if(!$opt.val()){
						return true;
					}
					items.push({
						title: $opt.text(),
						selected: $opt.is(':selected'),
						onSelect: function(){
							$opt.prop('selected', true).siblings('option').prop('selected', false);
							$select.change();
						}
					});
				});
				$select.hide();
				$.popupMenu({items: items});
			});
		};


	});

    $.fn.toggleFocus = function(){
    	return this.each(function(){
    		if($(this).is(':focus')){
    			$(this).parents('.ui-form-item').addClass('focus');
			}else{
                $(this).parents('.ui-form-item').removeClass('focus');
			}
		});
	};

    $.fn.toggleClear = function(){
		return this.each(function(){
			var $this = $(this),
			 	val = $(this).val(),
				$c = $this.siblings('.input-clear');
            if(!$c.length){
                $this.after($('<i class="input-clear">'));
            }
            val ? $c.show() : $c.hide();
		});
	};


})(jQuery);

/*
 * ==============================================
 *                    Popups
 * ==============================================
 */
;(function($){

	$(function(){
		$('body').append('<div class="popup-support-top">')
			.append('<div class="popup-support-bottom">');
	});

	/*
	* overlay(Boolean)			是否显示遮罩层
	* position(String)			弹窗位置
	* offset(Integer)
	* dismissible(Boolean) 		点击外部是否可关闭
	* transition(String)   		弹出效果，可选值：fade|pop|flip|turn|flow|slidefade|slide|slideup|slidedown|none
	* corners(Boolean)			已废弃
	* shadow(Boolean)			已废弃
	* stay(Integer)				停留时间
	* fullWidth(Boolean)		是否占满屏幕的全部宽度
	* */
	var defaults = {
		overlay: true,
		position: 'window',
		offset: 0,
		dismissible: true,
		transition: 'pop',
		corners: false,
		shadow: false,
		fullWidth: false,
		stay: 0,
		history: false
	};

	$.popQueue = []; 			// popup队列
	$.activePop = undefined; 	// 当前活动的popup

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
			{ text: '确认', close: true, onClick: cb}
		];
		var opts = {
			dismissible: false
		};
		return $.modal('confirm', title, text, buttons, opts);
	};

	$.loading = function(operate, message){
		if(!operate || operate === 'show'){
			var m = message || '加载中...';
			var $inner = $('<div class="popup-inner loading">')
				.append('<div class="popup-loading-icon"></div>')
				.append('<div class="loading-msg">' + m + '</div>');
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

	$.popupMenu = function(options){
		var $inner = $('<div class="popup-inner popupMenu">');
		$.each(options.items, function(i, item){
			var $item = $('<div class="menu-item popup-close">').text(item.title).on('click', item.onSelect);
			if(item.selected){
				$item.addClass('selected');
			}
			$inner.append($item);
		});
		return $.popup($inner, {
			dismissible: true,
			position: 'window',
			fullWidth: false,
			transition: 'pop'
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
				var $btn = $('<span class="popup-button">').text(btn.text);
				if(btn.close){ $btn.addClass('popup-close'); } // 是否触发关闭
				if(btn.warning){ $btn.addClass('red'); } // 是否是警告动作，按钮将标红
				$buttons.append( $btn.one('click', btn.onClick) );
			});
			$inner.append($buttons);
		}
		return $.popup($inner, options);
	};

	// jQuery mobile base popup
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
				if(func(opts.onCreate)){ opts.onCreate($popup); }
			},
			'popupafteropen': function(){
				if(func(opts.onOpen)){ opts.onOpen($popup); }
			},
			'popupbeforeposition': function(){
				if(func(opts.beforePosition)){ opts.beforePosition($popup); }
			},
			'popupafterclose': function(){
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
			arrow: opts.arrow,
			history: opts.history
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
	};

	$.closePopup = function(popup){
		return  $(popup).popup('close');
	};

	$.destroyPopup = function(popup){
		return $(popup).popup('destroy');
	};

	function func(f){
		return f !== undefined && $.isFunction(f);
	}

})(jQuery);


/*
 * ==============================================
 *                    ZCheck
 * ==============================================
 */
;(function($, window, document){
	$(function(){
		$(document).on('click', '.z-check:not(".disabled")', function(){
			$(this).toggleClass('checked').trigger('zcheckchange', {
				checked: $(this).hasClass('checked')
			});
		});
	});
})(jQuery, window, document);


/*
 * ==============================================
 *                    Switch
 * ==============================================
 */
;(function($){

	$.fn.switch = function(){
		return this.each(function(){
			
		});
	};

})(jQuery);