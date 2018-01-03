    var fileItemList = [];

    $(document).ready(function(){
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

        //initialize err indicators
        $('.err').css('visibility', 'hidden');
    });

    let Delta = Quill.import('delta');

    const data = new FormData();

    var feature = document.getElementById('image');

    feature.onchange = () => {
        const file = feature.files[0];
        // file type is only image.
        if (!(/^image\//.test(file.type))) {
            feature.value = "";
            alert('You could only upload images.');
        }else{
            uploadFile(feature.files[0], "feature");
        }
    };

    function constructFormPolicyData(policyData, fileItem) {
        console.log(policyData);
        var contentType = fileItem.type != '' ? fileItem.type : 'application/octet-stream'
        var url = policyData.url
        var filename = policyData.filename
        var repsonseUser = policyData.user
        // var keyPath = 'www/' + repsonseUser + '/' + filename
        var keyPath = policyData.file_bucket_path
        var fd = new FormData()
        fd.append('key', keyPath + filename);
        fd.append('acl','private');
        fd.append('Content-Type', contentType);
        fd.append("AWSAccessKeyId", policyData.key)
        fd.append('Policy', policyData.policy);
        fd.append('filename', filename);
        fd.append('Signature', policyData.signature);
        fd.append('file', fileItem);
        return fd
    }

    function fileUploadComplete(fileItem, policyData, type){
        filedata = {
            uploaded: true,
            fileSize: fileItem.size,
            file: policyData.file_id,
        }
        $.ajax({
            method:"POST",
            data: filedata,
            url: "/api/files/complete/",
            success: function(successdata){
                imgurl = policyData.url + policyData.file_bucket_path + policyData.filename;
                data.append('image', imgurl);
                if (type == "feature"){
                    $('.featureImg').html("<img src='" + imgurl + "' alt='featureImg' width='100%'>")
                }else if (type == "post"){
                    saveToServer(imgurl);
                }
            },
            error: function(jqXHR, textStatus, errorThrown){ 
                alert("An error occured, please refresh the page.")
            }
        })
    }

    function uploadFile(fileItem, type){
            var policyData;
            var newLoadingItem;
            // get AWS upload policy for each file uploaded through the POST method
            // Remember we're creating an instance in the backend so using POST is
            // needed.
            $.ajax({
                method:"POST",
                data: {
                    filename: fileItem.name
                },
                url: "/api/files/policy/",
                success: function(data){
                        policyData = data
                },
                error: function(data){
                    alert("An error occured, please try again later")
                }
            }).done(function(){
                // construct the needed data using the policy for AWS
                var fd = constructFormPolicyData(policyData, fileItem)

                // use XML http Request to Send to AWS. 
                var xhr = new XMLHttpRequest()

                // construct callback for when uploading starts
                xhr.upload.onloadstart = function(event){
                    var inLoadingIndex = $.inArray(fileItem, fileItemList)
                    if (inLoadingIndex == -1){
                        // Item is not loading, add to inProgress queue
                        newLoadingItem = {
                            file: fileItem,
                            id: policyData.file_id,
                            order: fileItemList.length + 1
                        }
                        fileItemList.push(newLoadingItem)
                      }
                    fileItem.xhr = xhr
                }

                // Monitor upload progress and attach to fileItem.
                // xhr.upload.addEventListener("progress", function(event){
                //     if (event.lengthComputable) {
                //      var progress = Math.round(event.loaded / event.total * 100);
                //         fileItem.progress = progress
                //                     // })

                xhr.upload.addEventListener("load", function(event){
                    console.log("Complete", event);
                    // handle FileItem Upload being complete.
                    setTimeout(()=>{
                        fileUploadComplete(fileItem, policyData, type);
                    }, 1000);
                })

                xhr.open('POST', policyData.url , true);
                console.log(policyData.url);
                xhr.send(fd);
            })
    };

    let Inline = Quill.import('blots/inline');
    let Block = Quill.import('blots/block');
    let BlockEmbed = Quill.import('blots/block/embed');

    class DividerBlot extends BlockEmbed { }
    DividerBlot.blotName = 'divider';
    DividerBlot.tagName = 'hr';

    class ImageBlot extends BlockEmbed {
        static create(value) {
            let node = super.create();
            node.innerHTML = "<img class='image' src='"+value.url+"' alt='"+value.alt+"'><br><input class='"+value.url+"' type='text' placeholder='Caption (optional)' value='"+value.text+"' style='text-align: center; border-style: none; color: #bbbbbb; font-style: italic;'><br>";
            return node;
        }

        static value(node) {
            if (node.querySelector(".image")){
                return {
                    alt: "VeRyRaNdOmIzEdDeFaUlTvAlUeOfThEaLtcApTiOn",
                    url: node.querySelector(".image").getAttribute('src'),
                    text: "VeRyRaNdOmIzEdDeFaUlTvAlUeOfThEcApTiOn"
                };
            }else{
                return {
                    alt: "VeRyRaNdOmIzEdDeFaUlTvAlUeOfThEaLtcApTiOn",
                    url: "",
                    text: "VeRyRaNdOmIzEdDeFaUlTvAlUeOfThEcApTiOn"
                };
            }
        }
    }
    ImageBlot.blotName = 'imagewithcaption';
    ImageBlot.tagName = 'div';

    class YTVideoBlot extends BlockEmbed {
        static create(url) {
        let node = super.create();
        node.setAttribute('src', url);
        node.setAttribute('frameborder', '0');
        node.setAttribute('allowfullscreen', true);
        return node;
        }

        static formats(node) {
            let format = {};
            if (node.hasAttribute('height')) {
                format.height = node.getAttribute('height');
            }
            if (node.hasAttribute('width')) {
                format.width = node.getAttribute('width');
            }
            return format;
        }

        static value(node) {
            return node.getAttribute('src');
        }

        format(name, value) {
            if (name === 'height' || name === 'width') {
                if (value) {
                    this.domNode.setAttribute(name, value);
                } else {
                    this.domNode.removeAttribute(name, value);
                }
            } else {
                super.format(name, value);
            }
        }
    }
    YTVideoBlot.blotName = 'ytvideo';
    YTVideoBlot.tagName = 'iframe';

    class VideoBlot extends BlockEmbed {
        static create(value) {
            let node = super.create();
            node.innerHTML = "<video class='video' preload='auto' autoplay='autoplay' loop='loop' muted='muted' src='"+value.url+"'></video><br><input class='"+value.url+"' type='text' placeholder='Caption (optional)' value='"+value.text+"' style='text-align: center; border-style: none; color: #bbbbbb; font-style: italic;'><br>";
            return node;
        }

        static value(node) {
            if (node.querySelector(".video")){
                return {
                    url: node.querySelector(".video").getAttribute('src'),
                    text: "VeRyRaNdOmIzEdDeFaUlTvAlUeOfThEvIdeOcApTiOn"
                };
            }else{
                return {
                    url: "",
                    text: "VeRyRaNdOmIzEdDeFaUlTvAlUeOfThEvIdeOcApTiOn"
                };
            }
        }
    }
    VideoBlot.blotName = 'videowithcaption';
    VideoBlot.tagName = 'div';

    Quill.register(ImageBlot);
    Quill.register(YTVideoBlot);
    Quill.register(VideoBlot);
    Quill.register(DividerBlot);

    let quill = new Quill('#editor-container', {
        modules: {
            clipboard: {
                matchers: [
                    ['div', function(node, delta) {
                        divcontent = new Delta();
                        for (i = 0; i < node.children.length; i++){
                            if (node.children[i].tagName == "IMG"){
                                img = node.children[i];
                                divcontent.insert({imagewithcaption: {alt: img.alt, url: img.src, text: img.alt}}, {"align": "center"});
                            }else if (node.children[i].tagName == "VIDEO"){
                                video = node.children[i];
                                divcontent.insert({videowithcaption: {url: video.src, text: ""}}, {"align": "center"});
                            }else{
                                if (node.children[i].querySelectorAll("img").length != 0){
                                    for (j = 0; j < node.children[i].querySelectorAll("img").length; j++){
                                        img = node.children[i].querySelectorAll("img")[j];
                                        divcontent.insert({imagewithcaption: {alt: img.alt, url: img.src, text: img.alt}}, {"align": "center"});
                                    }
                                }
                                if (node.children[i].querySelectorAll("video").length != 0){
                                    for (j = 0; j < node.children[i].querySelectorAll("video").length; j++){
                                        video = node.children[i].querySelectorAll("video")[j];
                                        divcontent.insert({videowithcaption: {url: video.src, text: ""}}, {"align": "center"});
                                    }
                                }
                                if (node.children[i].textContent){
                                    divcontent.insert(node.children[i].textContent).insert("\n");
                                }
                            }
                        }
                        return divcontent;
                    }],
                    ['img', function(node, delta) {
                        if (node.src){
                            if (node.alt){
                                alttext = node.alt;
                            }else{
                                alttext = "";
                            }
                            return new Delta().insert({imagewithcaption: {alt: node.alt, url: node.src, text: node.alt}}, {"align": "center"});
                        }
                            return new Delta();
                    }],
                ]
            },
            toolbar: [
                [{ header: [1, 2, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
            ]
        },
        scrollingContainer: '#scrolling-container',
        placeholder: 'Insert text here',
        theme: 'bubble'
    });

    quill.addContainer($("#sidebar-controls").get(0));
    quill.on(Quill.events.EDITOR_CHANGE, function(eventType, range) {
        if (eventType !== Quill.events.SELECTION_CHANGE) return;
        if (range == null) return;
        if (range.length === 0) {
            let [block, offset] = quill.scroll.descendant(Block, range.index);
            if (block != null && block.domNode.firstChild instanceof HTMLBRElement) {
                let lineBounds = quill.getBounds(range);
                $('#sidebar-controls').removeClass('active').show().css({
                left: lineBounds.left,
                top: lineBounds.top
                });
            } else {
                $('#sidebar-controls').hide();
                $('#sidebar-controls').removeClass('active');
            }
        } else {
            $('#sidebar-controls, #sidebar-controls').hide();
            $('#sidebar-controls').removeClass('active');
            let rangeBounds = quill.getBounds(range);
        }
    });

    $('#title').blur(function (){
        if (!$('#title').val()){
            $('#titleErr').css('visibility', 'visible');
        }else{
            $('#titleErr').css('visibility', 'hidden');
        }
    });
    $('#publish').blur(function (){
        if (!$('#publish').val()){
            $('#pubErr').css('visibility', 'visible');
        }else{
            $('#pubErr').css('visibility', 'hidden');
        }
    });
    $('#image').change(function (){
        if ((!$('#image').val())||(imgUpdate === 1)){
            $('#featureErr').css('visibility', 'visible');
        }else{
            $('#featureErr').css('visibility', 'hidden');
        }
    });
    $('#image').click(function (){
        if ((!$('#image').val())||(imgUpdate === 1)){
            $('#featureErr').css('visibility', 'visible');
        }else{
            $('#featureErr').css('visibility', 'hidden');
        }
    });
    quill.on('selection-change', function(range, oldRange, source) {
        if (range === null && oldRange !== null) {
            if (quill.getText().trim().length === 0){
                $('#contentErr').css('visibility', 'visible');
            }else{
                $('#contentErr').css('visibility', 'hidden');
            }
        }
    });

    $('#image-button').click(function() {
        var input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.click();

        // Listen upload local image and save to server
        input.onchange = () => {
            const file = input.files[0];

            // file type is only image.
            if (/^image\//.test(file.type)) {
                uploadFile(file, "post");
            } else {
                console.warn('You could only upload images.');
            }
        };
    });

    /**
    * Step2. save to server
    *
    * @param {File} file
    */
    function saveToServer(url) {
        const fd = new FormData();
        fd.append('image', url);

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


        $.ajax({
            url: '/api/posts/image/create/',
            processData: false,
            method: 'POST',
            dataType: "json",
            contentType: false,
            data: fd
            ,success: function(t) {
                insertToEditor(t.image);
            },error: function(t) {
                console.log(t);
            }
        })
    }

    /**
    * Step3. insert image url to rich editor.
    *
    * @param {string} url
    */
    function insertToEditor(url) {
    // push image url to rich editor.
        const range = quill.getSelection();
        // quill.insertEmbed(range.index,"proc-link",{text: caption});
        quill.insertEmbed(range.index, 'imagewithcaption', {alt: 'image', url: url, text: ""});
        quill.formatLine(range.index, 1, 'align', 'center');
        quill.setSelection(range.index + 3, Quill.sources.SILENT);
        // content.clipboard.dangerouslyPasteHTML(range.index, '<img src="'+url+'" class="ql-embed-selected">');
        // content.clipboard.dangerouslyPasteHTML(range.index, '<input type="textbox">');
    }

    $('#video-button').click(function() {
        let range = quill.getSelection(true);
        let url = prompt('Enter link URL');
        url = url.replace("watch?v=", "embed/");
        url = url.replace("&", "?");
        quill.insertEmbed(range.index, 'ytvideo', url, Quill.sources.USER);
        quill.formatText(range.index + 1, 1, { height: '170', width: '400' });
        quill.setSelection(range.index + 1, Quill.sources.SILENT);
        // $('#sidebar-controls').hide();
    });

    $('#divider-button').click(function() {
        let range = quill.getSelection(true);
        quill.insertEmbed(range.index, 'divider', true, Quill.sources.USER);
        quill.setSelection(range.index + 1, Quill.sources.SILENT);
        // $('#sidebar-controls').hide();
    });

    $('#show-controls').click(function() {
        $('#sidebar-controls').toggleClass('active');
        quill.focus();
    });