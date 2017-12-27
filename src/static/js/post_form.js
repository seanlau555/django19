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
            data.append('image', feature.files[0]);
        }
    };

    $(document).ready(function(){
        //create post
        $('#submit').on('click', function(){
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
        })
    })

    let Inline = Quill.import('blots/inline');
    let Block = Quill.import('blots/block');
    let BlockEmbed = Quill.import('blots/block/embed');

    class DividerBlot extends BlockEmbed { }
    DividerBlot.blotName = 'divider';
    DividerBlot.tagName = 'hr';

    class ImageBlot extends BlockEmbed {
        static create(value) {
            let node = super.create();
            node.innerHTML = "<img class='image' src='"+value.url+"' alt='"+value.alt+"'><br><input id='"+value.url+"' class='caption' type='text' placeholder='Caption (optional)' value='"+value.text+"' style='text-align: center; border-style: none; color: #bbbbbb; font-style: italic;'><br>";
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
            node.innerHTML = "<video class='video' preload='auto' autoplay='autoplay' loop='loop' muted='muted' src='"+value.url+"'></video><br><input id='"+value.url+"' class='caption' type='text' placeholder='Caption (optional)' value='"+value.text+"' style='text-align: center; border-style: none; color: #bbbbbb; font-style: italic;'><br>";
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
                left: lineBounds.left - 200,
                top: lineBounds.top - 920
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

    $('#image-button').click(function() {
        var input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.click();

        // Listen upload local image and save to server
        input.onchange = () => {
            const file = input.files[0];

            // file type is only image.
            if (/^image\//.test(file.type)) {
                saveToServer(file);
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
    function saveToServer(file) {
        const fd = new FormData();
        fd.append('image', file);

        console.log(file);

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
                console.log(t.image);
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