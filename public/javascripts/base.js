/**
 * Created by Administrator on 2016/12/2.
 */
// 表单验证
$(function () {
    var re1 = /^([a-z]|[A-Z])\w{5,15}$/;
    var re2 = /^\d{5,12}@[qQ][qQ]\.(com|cn)$/;
    var rightCount = 0;


    $('#name').change(function () {
        if($(this).val().length <= 5){
            $(this).next().css('visibility','visible');
            rightCount += 1;
            test();
        }else {
            $.popup('请输入正确的用户名');
            setTimeout(function () {
                $('.popup').fadeOut();
            },2000);
            $(this).next().css('visibility','hidden');
        }
        test();
    });
    $('#password').change(function () {
        if(re1.test($(this).val())){
            rightCount += 1;
            $(this).next().css('visibility','visible')
            test();
        }else {
            $.popup('密码开头必须为字母，长度为6-16位');
            setTimeout(function () {
                $('.popup').fadeOut();
            },2000);
            $(this).next().css('visibility','hidden');
        }
        test();
    });
    $('#passwords').change(function () {
        if($('#password').val() == $('#passwords').val()){
            $(this).next().css('visibility','visible');
            rightCount += 1;
            test();
        }else{
            $.popup('两次密码输入不一致');
            setTimeout(function () {
                $('.popup').fadeOut();
            },2000);
            $(this).next().css('visibility','hidden');
        }
    });
    $('#email').change(function () {
        if(re2.test($(this).val())){
            $(this).next().css('visibility','visible');
            rightCount += 1;
            test();
        }else{
            $.popup('QQ邮箱格式不正确');
            setTimeout(function () {
                $('.popup').fadeOut();
            },2000);
            $(this).next().css('visibility','hidden');
        }
    })


    function test() {
        if( rightCount < $('.reg_form input').length) {
            $('#btn').attr('disabled','false');
        }
        if ( rightCount == $('.reg_form input').length ) {
            $('#btn').removeAttr('disabled');
            rightCount = 0;
        }
    }


})


// 弹窗提示插件
$.extend({
    popup: function (value, callback) {
        // this.each(function() {

        // });
        $(".popup").remove();
        $(".mask").remove();

        // 声明变量插入内容
        var html = "<div class=\"popup popup01\">" + "  <div class=\"pop-close\"><span>×</span></div>" + "  <div class=\"pop-content\"></div>" + "</div>" + "<div class=\"mask\"></div>";
        $("body").append(html);
        $(".pop-content").html(value);
        $(".popup").hide();
        $(".popup").fadeIn();
        $(".mask:eq(0)").fadeIn();
        $("body").on("click", ".pop-close", function () {
            $(this).parents(".popup").fadeOut('fast', function () {
                this.remove();
            });
            $(".mask").fadeOut('fast', function () {
                if (typeof callback == "function") {
                    setTimeout(callback, 1000)
                }
                this.remove();
            });
        })
    }
})

// 回到顶部
$(function () {
    $('.scrollTop').click(function () {
        $('html,body').animate({scrollTop:'0'},500);
    })
})






