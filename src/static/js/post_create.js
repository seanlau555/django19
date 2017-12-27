    $(document).ready(function(){
        //create post
        $('#submit').on('click', function(){
            //check if empty
            if (!$('#title').val()){
                $('#titleErr').css('visibility', 'visible');
            }
            if (!$('#publish').val()){
                $('#pubErr').css('visibility', 'visible');
            }
            if (!$('#image').val()){
                $('#featureErr').css('visibility', 'visible');
            }
            if (quill.getText().trim().length === 0){
                $('#contentErr').css('visibility', 'visible');
            }
            if (($('#publish').val())&&($('#publish').val())&&($('#image').val())&&!(quill.getText().trim().length === 0)){
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
                var jscontent = quill.getContents();
                var strcontent = JSON.stringify(jscontent.ops);

                for(x = 0; x < document.getElementsByClassName('image').length; x++){
                    strcontent = strcontent.replace("VeRyRaNdOmIzEdDeFaUlTvAlUeOfThEaLtcApTiOn", document.getElementById(document.getElementsByClassName('image')[x].getAttribute("src")).value);
                    strcontent = strcontent.replace("VeRyRaNdOmIzEdDeFaUlTvAlUeOfThEcApTiOn", document.getElementById(document.getElementsByClassName('image')[x].getAttribute("src")).value);
                }

                for(y = 0; y < document.getElementsByClassName('video').length; y++){
                    strcontent = strcontent.replace("VeRyRaNdOmIzEdDeFaUlTvAlUeOfThEvIdeOcApTiOn", document.getElementById(document.getElementsByClassName('video')[y].getAttribute("src")).value);
                }

                // content.setContents(JSON.parse(strcontent));

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

                data.append('title', $('#title').val());
                data.append('content', strcontent);
                data.append('publish', $('#publish').val());

                $.ajax({
                    url: '/api/posts/create/',
                    processData: false,
                    method: 'POST',
                    dataType: "json",
                    contentType: false,
                    data: data,
                    success: function(t) {
                        // var pid=t.id;
                        console.log(t.id);
                        location.href = "../list/"
                    },error: function(t) {
                        console.log(t);
                    }
                })
            }
        })
    });