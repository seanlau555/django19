    $(document).ready(function(){
        function dataPreparation(){
            jscontent = quill.getContents();
            strcontent = JSON.stringify(jscontent.ops);

            for (x = 0; x < document.getElementsByClassName('image').length; x++){
                for (y = 0; y < document.getElementsByClassName(document.getElementsByClassName('image')[x].getAttribute("src")).length; y++){
                    strcontent = strcontent.replace("VeRyRaNdOmIzEdDeFaUlTvAlUeOfThEaLtcApTiOn", document.getElementsByClassName(document.getElementsByClassName('image')[x].getAttribute("src"))[y].value);
                    strcontent = strcontent.replace("VeRyRaNdOmIzEdDeFaUlTvAlUeOfThEcApTiOn", document.getElementsByClassName(document.getElementsByClassName('image')[x].getAttribute("src"))[y].value);
                }
            }

            for (x = 0; x < document.getElementsByClassName('video').length; x++){
                for (y = 0; y < document.getElementsByClassName(document.getElementsByClassName('video')[x].getAttribute("src")).length; y++){
                    strcontent = strcontent.replace("VeRyRaNdOmIzEdDeFaUlTvAlUeOfThEvIdeOcApTiOn", document.getElementsByClassName(document.getElementsByClassName('video')[x].getAttribute("src"))[y].value);
                }
            }

            strcontent = strcontent.replace(/{"insert":{"progress":true}},/g, "");
            strcontent = strcontent.replace(/,{"insert":{"progress":true}}/g, "");
            strcontent = strcontent.replace(/,{"insert":{"progress":true}},/g, "");

            data.set('title', $('#title').val());
            data.set('content', strcontent);
            data.set('publish', $('#publish').val());
            data.set('draft', true);

            var regex = /\s+/gi;
            var count = 0;
            $.each($('.ql-editor').children('p'), function( key, value ) {
                count += value.innerText.trim().replace(regex, ' ').split(/\s/).length;
                if (value.innerText.trim().replace(regex, ' ').length === 0){
                    count -=1;
                }
            });
            var read_time = Math.round(count/200);

            data.append('read_time', read_time);
        }

        //create blank post
        dataPreparation();
        $.ajax({
            url: '/api/posts/create/',
            processData: false,
            method: 'POST',
            dataType: "json",
            data: {},
            success: function(t) {
                console.log(t);
                pid = t.id;
                //tracking updates of the post
                setInterval(function(){
                    dataPreparation();
                    $.ajax({
                        url: '/api/posts/'+pid+'/edit/',
                        processData: false,
                        method: 'PUT',
                        dataType: "json",
                        contentType: false,
                        data: data,
                        success: function(t) {
                            pid = t.id;
                        },error: function(t) {
                            console.log(t);
                        }
                    })
                }, 3000);
            },error: function(t) {
                console.log(t);
            }
        })

        //publish post
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

                dataPreparation();
                data.set('draft', false);

                $.ajax({
                    url: '/api/posts/'+pid+'/edit/',
                    processData: false,
                    method: 'PUT',
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