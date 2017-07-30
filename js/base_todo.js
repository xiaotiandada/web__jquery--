/**
 * Created by Administrator on 2017/7/28.
 */
;(function () {
    'use strict';

    var $form_add_task = $('.add-task')
        , $window = $(window)
        , $body = $('body')
        , $task_delete_trigger
        , $task_detail
        , $task_detail_trigger
        , $task_detail = $('.task-detail')
        , $task_detail_mask = $('.task-detail-mask')
        , task_list = []
        , current_index
        , $update_form
        , $task_detail_content
        , $task_detail_content_input
        , $checkbox_complete
        , $msg = $('.msg')
        , $msg_content = $msg.find('.msg-content')
        , $msg_confirm = $msg.find('.confirmed')
        , $alerter = $('.alerter')
        ;

    init();

    $form_add_task.on('click', on_add_task_form_submit)
    $task_detail_mask.on('click', hide_task_detail)

    function pop(arg) {
        if (!arg) {
            console.error('pop title is required');
        }

        var conf = {}
            , $box
            , $mask
            , $title
            , $content
            , $confirm
            , $cancel
            , timer
            , dfd
            , confirmed
            ;

        dfd = $.Deferred();

        if (typeof arg == 'string')
            conf.title = arg;
        else {
            conf = $.extend(conf, arg);
        }

        $box = $('<div>' +
            '<div class="pop-title">' + conf.title + '</div>' +
            '<div class="pop-content">' +
            '<div>' +
            '<button style="margin-right: 5px;" class="primary confirm">纭畾</button>' +
            '<button class="cancel">鍙栨秷</button>' +
            '</div>' +
            '</div>' +
            '</div>')
            .css({
                color: '#444',
                width: 300,
                height: 'auto',
                padding: '15px 10px',
                background: '#fff',
                position: 'fixed',
                'border-radius': 3,
                'box-shadow': '0 1px 2px rgba(0,0,0,.5)'
            })

        $title = $box.find('.pop-title').css({
            padding: '5px 10px',
            'font-weight': 900,
            'font-size': 20,
            'text-align': 'center'
        })

        $content = $box.find('.pop-content').css({
            padding: '5px 10px',
            'text-align': 'center'
        })

        $confirm = $content.find('button.confirm');
        $cancel = $content.find('button.cancel');

        $mask = $('<div></div>')
            .css({
                position: 'fixed',
                background: 'rgba(0,0,0,.5)',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
            })

        timer = setInterval(function () {
            if (confirmed !== undefined) {
                dfd.resolve(confirmed);
                clearInterval(timer);
                dismiss_pop();
            }
        }, 50)

        $confirm.on('click', on_confirmed)
        $cancel.on('click', on_cancel);
        $mask.on('click', on_cancel);

        function on_cancel() {
            confirmed = false;
        }

        function on_confirmed() {
            confirmed = true;
        }


        function dismiss_pop() {
            $mask.remove();
            $box.remove();
        }

        function adjust_box_position() {
            var window_width = $window.width()
                , window_height = $window.height()
                , box_width = $box.width()
                , box_height = $box.height()
                , move_x
                , move_y
                ;

            move_x = (window_width - box_width) / 2;
            move_y = ((window_height - box_height) / 2) - 20;

            $box.css({
                left: move_x,
                top: move_y,
            })
        }

        $window.on('resize', function () {
            adjust_box_position();
        })
        $mask.appendTo($body);
        $box.appendTo($body);
        $window.resize();
        return dfd.promise();
    }

    function listen_msg_event() {
        $msg_confirm.on('click', function () {
            hide_msg();
        })
    }

    function on_add_task_form_submit(e) {
        var new_task = {}, $input;
        /*绂佺敤榛樿琛屼负*/
        e.preventDefault();
        /*鑾峰彇鏂癟ask鐨勫€�*/
        $input = $(this).find('input[name=content]');
        new_task.content = $input.val();
        /*濡傛灉鏂癟ask鐨勫€间负绌� 鍒欑洿鎺ヨ繑鍥� 鍚﹀垯缁х画鎵ц*/
        if (!new_task.content) return;
        /*瀛樺叆鏂癟ask*/
        if (add_task(new_task)) {
            // render_task_list();
            $input.val(null);
        }
    }

    /*鐩戝惉鎵撳紑Task璇︽儏浜嬩欢*/
    function listen_task_detail() {
        var index;
        $('.task-item').on('dblclick', function () {
            index = $(this).data('index');
            show_task_detail(index);
        })

        $task_detail_trigger.on('click', function () {
            var $this = $(this);
            var $item = $this.parent().parent();
            index = $item.data('index');
            show_task_detail(index);
        })
    }

    /*鐩戝惉瀹屾垚Task浜嬩欢*/
    function listen_checkbox_complete() {
        $checkbox_complete.on('click', function () {
            var $this = $(this);
            var index = $this.parent().parent().data('index');
            var item = get(index);
            if (item.complete)
                update_task(index, {complete: false});
            else
                update_task(index, {complete: true});
        })
    }

    function get(index) {
        return store.get('task_list')[index];
    }

    /*鏌ョ湅Task璇︽儏*/
    function show_task_detail(index) {
        /*鐢熸垚璇︽儏妯℃澘*/
        render_task_detail(index);
        current_index = index;
        /*鏄剧ず璇︽儏妯℃澘(榛樿闅愯棌)*/
        $task_detail.show();
        /*鏄剧ず璇︽儏妯℃澘mask(榛樿闅愯棌)*/
        $task_detail_mask.show();
    }

    /*鏇存柊Task*/
    function update_task(index, data) {
        if (!index || !task_list[index])
            return;

        task_list[index] = $.extend({}, task_list[index], data);
        refresh_task_list();
    }

    /*闅愯棌Task璇︽儏*/
    function hide_task_detail() {
        $task_detail.hide();
        $task_detail_mask.hide();
    }

    /*娓叉煋鎸囧畾Task鐨勮缁嗕俊鎭�*/
    function render_task_detail(index) {
        if (index === undefined || !task_list[index])
            return;

        var item = task_list[index];

        var tpl =
            '<form>' +
            '<div class="content">' +
            item.content +
            '</div>' +
            '<div class="input-item">' +
            '<input style="display: none;" type="text" name="content" value="' + (item.content || '') + '">' +
            '</div>' +
            '<div>' +
            '<div class="desc input-item">' +
            '<textarea name="desc">' + (item.desc || '') + '</textarea>' +
            '</div>' +
            '</div>' +
            '<div class="remind input-item">' +
            '<label>鎻愰啋鏃堕棿</label>' +
            '<input class="datetime" name="remind_date" type="text" value="' + (item.remind_date || '') + '">' +
            '</div>' +
            '<div class="input-item"><button type="submit">鏇存柊</button></div>' +
            '</form>';

        /*鐢ㄦ柊妯℃澘鏇挎崲鏃фā鏉�*/
        $task_detail.html(null);
        $task_detail.html(tpl);
        $('.datetime').datetimepicker();
        /*閫変腑鍏朵腑鐨刦orm鍏冪礌, 鍥犱负涔嬪悗浼氫娇鐢ㄥ叾鐩戝惉submit浜嬩欢*/
        $update_form = $task_detail.find('form');
        /*閫変腑鏄剧ずTask鍐呭鐨勫厓绱�*/
        $task_detail_content = $update_form.find('.content');
        /*閫変腑Task input鐨勫厓绱�*/
        $task_detail_content_input = $update_form.find('[name=content]');

        /*鍙屽嚮鍐呭鍏冪礌鏄剧ずinput, 闅愯棌鑷繁*/
        $task_detail_content.on('dblclick', function () {
            $task_detail_content_input.show();
            $task_detail_content.hide();
        })

        $update_form.on('submit', function (e) {
            e.preventDefault();
            var data = {};
            /*鑾峰彇琛ㄥ崟涓悇涓猧nput鐨勫€�*/
            data.content = $(this).find('[name=content]').val();
            data.desc = $(this).find('[name=desc]').val();
            data.remind_date = $(this).find('[name=remind_date]').val();

            update_task(index, data)
            hide_task_detail();
        })
    }

    /*鏌ユ壘骞剁洃鍚墍鏈夊垹闄ゆ寜閽殑鐐瑰嚮浜嬩欢*/
    function listen_task_delete() {
        $task_delete_trigger.on('click', function () {
            var $this = $(this);
            /*鎵惧埌鍒犻櫎鎸夐挳鎵€鍦ㄧ殑task鍏冪礌*/
            var $item = $this.parent().parent();
            var index = $item.data('index');
            /*纭鍒犻櫎*/
            pop('纭畾鍒犻櫎?')
                .then(function (r) {
                    r ? delete_task(index) : null;
                })
        })
    }

    function add_task(new_task) {
        /*灏嗘柊Task鎺ㄥ叆task_list*/
        task_list.push(new_task);
        /*鏇存柊localStorage*/
        refresh_task_list();
        return true;
    }

    /*
     * 鍒锋柊localStorage鏁版嵁骞舵覆鏌撴ā鏉�
     * */
    function refresh_task_list() {
        store.set('task_list', task_list);
        render_task_list();
    }

    /*鍒犻櫎涓€鏉ask*/
    function delete_task(index) {
        /*濡傛灉娌℃湁index 鎴栬€卛ndex涓嶅瓨鍦ㄥ垯鐩存帴杩斿洖*/
        if (index === undefined || !task_list[index]) return;

        delete task_list[index];
        /*鏇存柊localStorage*/
        refresh_task_list();
    }

    function init() {
        task_list = store.get('task_list') || [];
        listen_msg_event();
        if (task_list.length)
            render_task_list();
        task_remind_check();
    }

    function task_remind_check() {
        var current_timestamp;
        var itl = setInterval(function () {
            for (var i = 0; i < task_list.length; i++) {
                var item = get(i), task_timestamp;
                if (!item || !item.remind_date || item.informed)
                    continue;

                current_timestamp = (new Date()).getTime();
                task_timestamp = (new Date(item.remind_date)).getTime();
                if (current_timestamp - task_timestamp >= 1) {
                    update_task(i, {informed: true});
                    show_msg(item.content);
                }
            }
        }, 300);
    }

    function show_msg(msg) {
        if (!msg) return;

        $msg_content.html(msg);
        $alerter.get(0).play();
        $msg.show();
    }

    function hide_msg() {
        $msg.hide();
    }

    /*
     * 娓叉煋鎵€鏈塗ask妯℃澘
     * */
    function render_task_list() {
        var $task_list = $('.task-list');
        $task_list.html('');
        var complete_items = [];
        for (var i = 0; i < task_list.length; i++) {
            var item = task_list[i];
            if (item && item.complete)
                complete_items[i] = item;
            else
                var $task = render_task_item(item, i);
            $task_list.prepend($task);
        }

        for (var j = 0; j < complete_items.length; j++) {
            $task = render_task_item(complete_items[j], j);
            if (!$task) continue;
            $task.addClass('completed');
            $task_list.append($task);
        }

        $task_delete_trigger = $('.action.delete')
        $task_detail_trigger = $('.action.detail')
        $checkbox_complete = $('.task-list .complete[type=checkbox]')
        listen_task_delete();
        listen_task_detail();
        listen_checkbox_complete();
    }

    /*
     *娓叉煋鍗曟潯Task妯℃澘
     * */
    function render_task_item(data, index) {
        if (!data || !index) return;
        var list_item_tpl =
            '<div class="task-item" data-index="' + index + '">' +
            '<span><input class="complete" ' + (data.complete ? 'checked' : '') + ' type="checkbox"></span>' +
            '<span class="task-content">' + data.content + '</span>' +
            '<span class="fr">' +
            '<span class="action delete"> 鍒犻櫎</span>' +
            '<span class="action detail"> 璇︾粏</span>' +
            '</span>' +
            '</div>';
        return $(list_item_tpl);
    }
})();