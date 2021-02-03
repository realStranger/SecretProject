<template>
    <div contenteditable="true" @input="update" @blur="blur" @keyup.13="$emit('keyup-enter')" ></div>
</template>

<script>
export default {
    props : {
        content : {
            type : String,
            default : '',
        },
    },
    mounted:function(){
        this.$el.innerText = this.content;
    },
    methods:{
        update (event) {
            this.$emit('update', event.target.innerText);
        },
        blur (event) {
            this.$emit('blur', event.target.innerText);
            this.$emit('change', event.target.innerText);
        },
        clear () {
            this.$el.innerText = '';
        },
    }
}
</script>
