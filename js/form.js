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