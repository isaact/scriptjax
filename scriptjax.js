/*

 jQuery scriptjax plugin

 MIT license.

 */

(function($) {
	var settings = {
		'ajaxSubmitClass' : 'ajaxSubmitButton',
		'ajaxSpinnerClass' : 'ajaxSpinner',
	};
	/*******************************
	 * Handler methods
	 *******************************/
	var handlers = {
		redirect: function(update){
			window.location = update.location;
		},
		updateData: function (update) {
			pageData[update.key] = update.val;
		},
		updateHTML: function (update) {
			$(update.selector).html(update.html);
		},
		addClass: function (update) {
			$(update.selector).addClass(update.cls);
		},
		deleteClass: function (update) {
			$(update.selector).removeClass(update.cls);
		},
		updateValue: function (update) {
			$(update.selector).val(update.val);
		},
		disableField: function (update) {
			$(update.selector).disable();
		},
		enableFields: function (update) {
			$(update.selector).enable();
		}
	}
	var methods = {
		init : function(options) {
			if(options) {
				$.extend(settings, options);
			}
		},
		addAjaxSubmit : function (formid, responseObj) {
			var destAction = $(formid).attr('action');
			$(formid + ' input.ajaxSubmit').unbind('click');
			$(formid + ' input.ajaxSubmit').click(function() {
				$(formid + ' ' + settings.ajaxSpinnerClass).removeClass('hidden');
				var query = $(formid).serializeArray(), data = {};
				data[this.name] = this.value;
				for (i in query) {
					if (isdefined(data[query[i].name])) {
						if (jQuery.isArray(data[query[i].name])) {
							tmp = data[query[i].name];
							tmp.push(query[i].value);
							data[query[i].name] = tmp;
						} else {
							curr = [];
							curr.push(data[query[i].name]);
							curr.push(query[i].value);
							data[query[i].name] = curr;
						}

					} else {
						data[query[i].name] = query[i].value;
					}
				}
				submitForm(this.id, data, destAction, formid, responseObj);
			});
		},
		ajaxUpdate: function(updates) {
			updatePage(updates)
		}
	};

	$.fn.scriptjax = function(method) {
		// Method calling logic
		if(methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if( typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.scriptjax');
		}
	};
	/*******************************
	 * Private methods
	 *******************************/
	function submitForm(fields, formData, destAction, formid, responseObj) {
		formData['AJAX_VALIDATE_FIELDS'] = fields;
		formData['AJAX_VALIDATE'] = 1;
		$.ajax( {		
			type : "POST",
			url : destAction,
			data : formData,
			dataType : 'json',
			success : function(returnData) {
				$(formid + ' ' + settings.ajaxSpinnerClass).addClass('hidden');
				updatePage(returnData)
				if(typeof responseObj !== 'undefined'){
					if(errors > 0){
						responseObj.errors(data);
					}else{
						responseObj.success(data);
					}
				}
			},
			error : function(XHR, msg, error) {
				$('.spin-ajax-loader-box').addClass('hidden');
				if(responseObj != undefined){
					responseObj.fail();
				}
			}
		});
	}
	function updatePage(updates){
		if (updates) {
			var len=updates.length;
			for(var i=0; i<len; i++) {
				var update = updates[i];
				if (handlers[update.type]){
					handlers[update.type](update);
				}
			}
		}
	}
})(jQuery);
