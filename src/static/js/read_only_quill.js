let Delta = Quill.import('delta');

let Inline = Quill.import('blots/inline');
let Block = Quill.import('blots/block');
let BlockEmbed = Quill.import('blots/block/embed');
let Parchment = Quill.import('parchment');

class DividerBlot extends BlockEmbed { }
DividerBlot.blotName = 'divider';
DividerBlot.tagName = 'hr';

class ImageBlot extends BlockEmbed {
    static create(value) {
        let node = super.create();
        node.innerHTML = "<br><img class='image' src='"+value.url+"' alt='"+value.alt+"'><br><p style='text-align: center; color: #bbbbbb; font-style: italic;'>"+value.alt+"</p><br>";
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

class ProgressBlot extends BlockEmbed {
    static create(value) {
        let node = super.create();
        node.setAttribute('id', value.id);
        node.innerHTML = value.name + "<br/>" + "<div class=\"progress\">" + "<div class=\"progress-bar progress-bar-striped active\" role=\"progressbar\" style='width:" + value.progress + "%' aria-valuenow='" + value.progress + "' aria-valuemin=\"0\" aria-valuemax=\"100\"></div></div>";
        return node;
    }
}
ProgressBlot.blotName = 'progress';
ProgressBlot.tagName = 'div';

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
Quill.register(ProgressBlot);

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
                    // var url = node.src;
                    // var xhr = new XMLHttpRequest();
                    // xhr.open('GET', url, true);
                    // xhr.onload = function(e) {
                    //     if (this.status == 200) {
                    //         var imgFile = this.response;
                    //         imgFile.lastModifiedDate = new Date();
                    //         imgFile.name = (node.alt) ? node.alt : "copiedImg";
                    //         console.log(imgFile);
                    //         copyalt = (node.alt) ? node.alt : "";
                    //         uploadFile(imgFile, "post");
                    //     }
                    // };
                    // xhr.send();

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
    theme: 'bubble',
    scrollContainer: 'scroll-container',
});

// quill.addContainer($("#sidebar-controls").get(0));
quill.on(Quill.events.EDITOR_CHANGE, function(eventType, range) {
    if (eventType !== Quill.events.SELECTION_CHANGE) return;
    if (range == null) return;
    if (range.length === 0) {
        let [block, offset] = quill.scroll.descendant(Block, range.index);
        if (block != null && block.domNode.firstChild instanceof HTMLBRElement) {
            let lineBounds = quill.getBounds(range);
            $('#sidebar-controls').removeClass('active').css('visibility', 'visible');
        } else {
            $('#sidebar-controls').css('visibility', 'hidden');;
            $('#sidebar-controls').removeClass('active');
        }
    } else {
        $('#sidebar-controls, #sidebar-controls').css('visibility', 'hidden');
        $('#sidebar-controls').removeClass('active');
        let rangeBounds = quill.getBounds(range);
    }
});

lastLine = $("#editor-container p").length;
lastHeight = $("#editor-container").innerHeight();

quill.on('text-change', function() {
    if($("#editor-container p").length != lastLine){
        if($("#editor-container p").length < lastLine){
            $("#editor-container").innerHeight(lastHeight);
        }
    }
    if ($("#editor-container").innerHeight() < $("#editor-container").prop('scrollHeight')){
        $("#editor-container").innerHeight($("#editor-container").prop('scrollHeight'));
    }
    lastLine = $("#editor-container p").length;
})