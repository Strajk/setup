/***  diigo Modal *****/
var diigoModal = {
    diigoModal: $('.diigoModal'),
    overlay: $('.diigoModal').find('.overlay'),

    init: function () {
        var that = this;
        this.diigoModal.find('.modalCloseButton').on('click', function () {
            that.hide();
        });
    },

    show: function(which) {
       this.diigoModal.addClass('show');
       if (which == 'save') {
           which = 'edit';
           $('#diigo-edit-window').find('.modalHeaderTitle').text('Save to Diigo');
       } else if (which == 'edit') {
           $('#diigo-edit-window').find('.modalHeaderTitle').text('Edit');
       }
        $('#diigo-' + which + '-window').addClass('show');

    },

    hide: function () {
        this.diigoModal.removeClass('show');
        this.diigoModal.find('.modalWindow').removeClass('show');
    },

    resetForm: function() {
       $('#diigobm-list').removeClass('inputed').find('.content').text('');
        $('#diigobm-group').removeClass('inputed').find('.content').text('');
    }


};

diigoModal.init();



