<template>
    <transition name="slide-modal">
        <div v-if="open" class="modal">
            <div class="modal-content">
                <h2 class="modal-title p-12">
                    {{ product ? 'Редактировать продукт' : 'Добавить продукт' }}
                </h2>
                <form class="modal-form">
                    <div class="form-group">
                        <label>Название</label>
                        <input v-model="title" type="text" required placeholder="Введите название продукта" />
                    </div>
                    <div class="form-group">
                        <label>Цена</label>
                        <input v-model="price" type="number" required placeholder="Введите цену" />
                    </div>

                </form>
                <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
                <div class="modal-buttons gap24 d-flex j-end a-center p-12">
                    <button type="button" class="action-button" @click="closeModal">Отмена</button>
                    <button type="button" class="action-button" @click="handleSubmit"
                    :disabled="isSubmitting" :class="{ 'is-disabled': isSubmitting }">
                        {{ isEdit ? 'Сохранить' : 'Создать' }}
                    </button>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
import eventNames from '@/universal/eventNames';
import { ipcRenderer } from 'electron';

export default {
    props: {
        open: {
            type: Boolean,
            default: false,
        },
        isEdit: {
            type: Boolean,
            default: false,
        },
        product: {
            type: Object,
            default:null
        },
    },
    data() {
        return {
            id: null,
            title: '',
            colors: ['oq'],
            colorInput: '',
            price: 0,
            errorMessage: '',
            isSubmitting:false
        };
    },
    watch: {
        product: {
            immediate: true,
            handler(newVal) {
                this.id = newVal?._id || null;
                this.title = newVal?.title || '';
                this.colors = newVal?.colors || [];
                this.price = newVal?.price || 0;
            },
        },
    },
    methods: {
        closeModal() {
            this.$emit('close');
        },
        addColor() {
            if (this.colorInput.trim() && !this.colors.includes(this.colorInput.trim())) {
                this.colors.push(this.colorInput.trim());
            }
            this.colorInput = '';
        },
        removeColor(index) {
            this.colors.splice(index, 1);
        },
        async handleSubmit() {
            if (!this.title || this.price <= 0) {
                this.errorMessage = 'Пожалуйста, заполните все обязательные поля';
                return;
            }

            const payload = {
                title: this.title,
                colors: this.colors,
                price: this.price,
            };
            this.isSubmitting=true
            if(this.product){
                await ipcRenderer.invoke(eventNames.updateMyProductEvent, JSON.parse(JSON.stringify({...payload,id:this.id})))
                .then((res) => {
                    if(res?.status==200){
                        this.isSubmitting=false
                        this.$emit('status','success')
                    }
                    else{
                        this.$emit('status','error')
                    }
                })
            }
            else{
                await ipcRenderer.invoke(eventNames.createMyProductEvent, JSON.parse(JSON.stringify(payload)))
                    .then((res) => {
                        this.isSubmitting=false

                        if(res?.status==200 ){
                            this.$emit('status','success')                        
                        }
                        else{
                            this.$emit('status','error')
                        }
                    })
            }
            this.resetForm();
            this.closeModal();
        },
        resetForm() {
            this.title = '';
            this.colors = [];
            this.colorInput = '';
            this.price = 0;
            this.errorMessage = '';
        },
    },
};
</script>

<style scoped>
.color-list {
    list-style: none;
    padding: 0;
    margin: 10px 0;
}

.color-item {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
}

.delete-button {
    margin-left: 10px;
    background: red;
    color: white;
    border: none;
    border-radius: 5px;
    padding: 2px 5px;
    cursor: pointer;
}
</style>
