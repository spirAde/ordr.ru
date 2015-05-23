function getClientHeight() {return $(window).height();}
function getClientWidth() {return $(window).width();}

var height = getClientHeight();
var width = getClientWidth();

$(document).ready(function() {

    //Custom range input
    $("#range-2").ionRangeSlider({
        min: 100,
        max: 1000,
        type: 'single',
        step: 50,
        prettify: false,
        hasGrid: false
    });

    $("#range-1").ionRangeSlider({
        min: 100,
        max: 1000,
        from: 300,
        to: 900,
        type: 'double',
        step: 50,
        hasGrid: false
    });

    // Sorting
    $('.sorting a').click(function() {
        $(this).toggleClass("active up down");
        return false;
    });

    // Show hide calendar
    $('.step-1 .field-date input').focusin(function() {
        $('.time-calendar').addClass("active");
        return false;
    });

    $('.map').click(function() {
        $('.time-calendar').removeClass("active");
        return false;
    });

    //Show hide mobile filter
    $('.header-filter').click(function() {
        $('.header-filter').hide();
        $('.filter').show();
        return false;
    });

    $('.show-content div').click(function() {
        $('.header-filter').show();
        $('.filter').hide();
        return false;
    });

    // Show booking
    $('#item-1 .more-info a').click(function() {
        $(this).toggleClass("active");
        $('.order').toggleClass("active");
        $('.reviews').toggleClass("opened");
        return false;
    });

    $('#item-1 .next-step a').click(function() {
        $('.time-calendar').removeClass("active");
        $('.step-2').addClass("active");
        $('.step-1').addClass("hide");
        return false;
    });

    //Datepicker
    $('.filter .field-date input').datetimepicker({
        lang:'ru',
        format:'d.m.Y H:i',
        closeOnDateSelect:true,
        scrollFast: false,
        todayButton: false,
        dayOfWeekStart: 1,
        i18n:{
            ru:{
                dayOfWeek:[
                    "Вс", "Пн", "Вт", "Ср",
                    "Чт", "Пт", "Сб",
                ]
            }
        }
    });

    // Custom scroll
    if ($('body').width() > 1024)
    {
        $('.scroll').perfectScrollbar({
            suppressScrollX: true
        });
    }

    //Lightbox
    var activityIndicatorOn = function()
        {
            $( '<div id="imagelightbox-loading"><div class="loading"><div class="double-bounce1"></div><div class="double-bounce2"></div></div></div>' ).appendTo( 'body' );
        },
        activityIndicatorOff = function()
        {
            $( '#imagelightbox-loading' ).remove();
        },

        overlayOn = function()
        {
            $( '<div id="imagelightbox-overlay"></div>' ).appendTo( 'body' );
        },
        overlayOff = function()
        {
            $( '#imagelightbox-overlay' ).remove();
        },

        closeButtonOn = function( instance )
        {
            $( '<button type="button" id="imagelightbox-close" title="Close"></button>' ).appendTo( 'body' ).on( 'click touchend', function(){ $( this ).remove(); instance.quitImageLightbox(); return false; });
        },
        closeButtonOff = function()
        {
            $( '#imagelightbox-close' ).remove();
        };

    $('a.lightbox').imageLightbox( {
        onStart: 	 function() { overlayOn(); closeButtonOn(); },
        onEnd:	 	 function() { closeButtonOff(); overlayOff(); activityIndicatorOff(); },
        onLoadStart: function() { activityIndicatorOn(); },
        onLoadEnd:	 function() { activityIndicatorOff(); }
    });

    //Multiselect
    $('select').SumoSelect({
        captionFormat:'{0} выбрано',
        placeholder: 'Дополнительные услуги',
        nativeOnDevice: ['Opera Mini']
    });

    //Filter
    $('.filter-more a').click(function() {
        $('.filter').addClass('opened');
        return false;
    });

    $('.show-content a').click(function() {
        $('.filter').removeClass('opened');
        return false;
    });

    $(window).scroll(function() {
        if ($(this).scrollTop() >= 300) {
            $('.filter-options').addClass('attached');
        }
        else {
            $('.filter-options').removeClass('attached');
        }
    });

    //Slider
    $('.photo .slider').owlCarousel({
        loop:true,
        responsiveClass:true,
        nav:false,
        responsive:{
            0:{
                items:1
            },
            600:{
                items:2
            },
            1000:{
                items:3
            }
        }
    });

    //123
    // Custom scroll
    if ($('body').width() < 600)
    {
        $('.time-calendar .scroll').owlCarousel({
            loop:false,
            responsiveClass:true,
            nav:false,
            items:2,
            margin: 20
        });
    }



});