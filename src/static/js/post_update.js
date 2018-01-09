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
                if($("#publish").val()){
                    publish = $('#publish').val();
                }
            }

            if($("#private").prop("checked")){
                data.set('private', true);
            }else{
                data.set('private', false);
            }

            data.set('title', $('#title').val());
            data.set('content_html', preview);
            data.set('content', strcontent);
            if($("#publish").val()){
                data.set('publish', publish);
                publish = "alreadyPublished"
            }
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

        if (($("#publish").val() < now)&&(!draft)){
            $("#date").html("Already published<br>");
        }

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
            if (!publish){
                $('#pubErr').css('visibility', 'visible');
            }
            if ($('.featureImg').find('img').length === 0){
                $('#featureErr').css('visibility', 'visible');
            }
            if (quill.getText().trim().length === 0){
                $('#contentErr').css('visibility', 'visible');
            }
            if (($('#title').val())&&($('#publish').val())&&(publish)&&($('.featureImg').find('img').length > 0)&&!(quill.getText().trim().length === 0)){
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
                        location.href = "../../list/"
                    },error: function(t) {
                        console.log(t);
                    }
                })
            }
        })
    });

    quill.setContents(content);