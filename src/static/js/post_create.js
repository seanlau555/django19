    $(document).ready(function(){
        now = new Date;
        now = now.getFullYear() + '-' + ('0' + (now.getMonth()+1)).slice(-2) + "-" + ('0' + now.getDate()).slice(-2);

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

            txtContent = quill.getText();
            preview = txtContent.replace(/[\r\n]+/g, " ");
            length1 = preview.length;
            preview = txtContent.replace(/[\r\n]+/g, " ").replace(/^(.{50}[^\s]*).*/, "$1");
            length2 = preview.length;
            if (length1 > length2 + 1){
                preview = preview.concat("...");
            }

            if($("#now").prop("checked")){
                publish = new Date;
                publish = publish.getFullYear() + '-' + ('0' + (publish.getMonth()+1)).slice(-2) + "-" + ('0' + publish.getDate()).slice(-2);
            }else{
                publish = $('#publish').val();
            }

            if($("#private").prop("checked")){
                data.set('private', true);
            }else{
                data.set('private', false);
            }

            data.set('title', $('#title').val());
            data.set('content_html', preview);
            data.set('content', strcontent);
            data.set('publish', publish);
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

        dataChanged = false;
        postCreated = false;

        setInterval(function(){
            $('#title, #publish, #image').on('change', function(){
                dataChanged = true;
            });

            quill.on('text-change', function(delta, oldDelta, source){
                dataChanged = true;
            });

            //create blank post
            if (dataChanged && !postCreated){
                dataPreparation();
                $.ajax({
                    url: '/api/posts/create/',
                    processData: false,
                    method: 'POST',
                    dataType: "json",
                    data: {},
                    success: function(t) {
                        console.log(t);
                        postCreated = true;
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
                        }, 1000);
                    },error: function(t) {
                        console.log(t);
                    }
                })
            }
        }, 1000);

        //publish post
        $('#submit').on('click', function(){
            //check if empty
            now = new Date;
            now = now.getFullYear() + '-' + ('0' + (now.getMonth()+1)).slice(-2) + "-" + ('0' + now.getDate()).slice(-2);

            if (!$('#title').val()){
                $('#titleErr').css('visibility', 'visible');
            }
            if (publish < now){
                $('#pubErr').css('visibility', 'visible');
            }
            if (!$('#publish').val()){
                $('#pubErr').css('visibility', 'visible');
            }
            if ($('.featureImg').find('img').length === 0){
                $('#featureErr').css('visibility', 'visible');
            }
            if (quill.getText().trim().length === 0){
                $('#contentErr').css('visibility', 'visible');
            }

            if (($('#title').val())&&(publish)&&(publish >= now)&&($('.featureImg').find('img').length > 0)&&!(quill.getText().trim().length === 0)){
                dataPreparation();
                data.set('draft', false);
            if(!$("#private").prop("checked")){
                data.set('published', true);
            }
                data.set('content_display', strcontent);

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
                        location.href = "../"+pid+"/";
                    },error: function(t) {
                        console.log(t);
                    }
                })
            }
        })
    });