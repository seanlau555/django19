// function draftCheck(){
// 	if($("#d1").prop("checked")){
// 		$('input[name="publish"]').attr('disabled', 'disabled');
// 	}
// 	if($("#d2").prop("checked")){
// 		$('input[name="publish"]').removeAttr( "disabled" );
// 	}
// 	if($("#d3").prop("checked")){
// 		$('input[name="publish"]').removeAttr( "disabled" );
// 	}
// }

// function publishCheck(){
// 	if($("#p1").prop("checked")){
// 		$('input[name="draft"]').attr('disabled', 'disabled');
// 	}
// 	if($("#p2").prop("checked")){
// 		$('input[name="draft"]').removeAttr( "disabled" );
// 	}
// 	if($("#p3").prop("checked")){
// 		$('input[name="draft"]').removeAttr( "disabled" );
// 	}
// }

$(window).on('resize', function(){
	if($(this).width() != width){
		$('.titleText').each(function() {
			var $c = $(this).clone().appendTo('body').css({'display': 'inline', 'width': 'auto', 'font-size': '26px', 'visibility': 'hidden'});

			if ($(window).width() <= 767) {
				if ($c.width() > $(".card").width() - 270) {
					$(this).attr('data-original-title', $(this).text());
				} else {
					$(this).attr('data-original-title', '');
				}
			} else {
				if ($c.width() > $(this).width()) {
					$(this).attr('data-original-title', $(this).text());
				} else {
					$(this).attr('data-original-title', '');
				}
			}

			$c.remove();
		});
	}

	var width = $(window).width();
});

$(document).ready(function(){
	$('[data-toggle="tooltip"]').tooltip();

	$('.titleText').each(function() {
		var $c = $(this).clone().appendTo('body').css({'display': 'inline', 'width': 'auto', 'font-size': '26px', 'visibility': 'hidden'});

		if ($(window).width() <= 767) {
			if ($c.width() > $(".card").width() - 270) {
				$(this).attr('data-original-title', $(this).text());
			} else {
				$(this).attr('data-original-title', '');
			}
		} else {
			if ($c.width() > $(this).width()) {
				$(this).attr('data-original-title', $(this).text());
			} else {
				$(this).attr('data-original-title', '');
			}
		}

		$c.remove();
	});

	var width = $(window).width();	
	// setup session cookie data. This is Django-related
	function getCookie(name) {
	    var cookieValue = null;
	    if (document.cookie && document.cookie !== '') {
	        var cookies = document.cookie.split(';');
	        for (var i = 0; i < cookies.length; i++) {
	            var cookie = jQuery.trim(cookies[i]);
	            // Does this cookie string begin with the name we want?
	            if (cookie.substring(0, name.length + 1) === (name + '=')) {
	                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
	                break;
	            }
	        }
	    }
	    return cookieValue;
	}
	var csrftoken = getCookie('csrftoken');
	function csrfSafeMethod(method) {
	    // these HTTP methods do not require CSRF protection
	    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
	}
	$.ajaxSetup({
	    beforeSend: function(xhr, settings) {
	        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
	            xhr.setRequestHeader("X-CSRFToken", csrftoken);
	        }
	    }
	});
	// end session cookie data setup.

	// draftCheck();
	// publishCheck();
	// $(".d").on("change", function(){
	// 	draftCheck();
	// });
	// $(".p").on("change", function(){
	// 	publishCheck();
	// });

	$(".public").click(function(){
		pid = this.id;

		const data = new FormData();
        data.set('private', false);
		data.set('published', true);

        $.ajax({
            url: '/api/posts/'+pid+'/edit/',
            processData: false,
            method: 'PUT',
            dataType: "json",
            contentType: false,
            data: data,
            success: function(t) {
                // var pid=t.id;
                location.reload();
            },error: function(t) {
                console.log(t);
            }
        })
	})

	$(".private").click(function(){
		pid = this.id;

		const data = new FormData();
        data.set('private', true);
		data.set('published', true);

        $.ajax({
            url: '/api/posts/'+pid+'/edit/',
            processData: false,
            method: 'PUT',
            dataType: "json",
            contentType: false,
            data: data,
            success: function(t) {
                // var pid=t.id;
                location.reload();
            },error: function(t) {
                console.log(t);
            }
        })
	})

	$(".delete").click(function(){
		pid = this.id;
		if (confirm("Do you want to delete this post?")){
	        $.ajax({
	            url: '/api/posts/'+pid+'/delete/',
	            processData: false,
	            method: 'DELETE',
	            dataType: "json",
	            contentType: false,
	            success: function(t) {
	                location.reload();
	            },error: function(t) {
	                console.log(t);
	            }
	        })
		}
	})
})