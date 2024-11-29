<template>
    <transition name="slide-modal">
        <div v-if="open" class="modal">
            <div class="modal-content">
                <h2 class="modal-title p-12">
                    {{ oneWorker ? 'Редактирование по специалист ' : 'Создать специалиста' }}
                </h2>
                <form class="modal-form">
                    <div class="form-group">
                        <label>Имя работника</label>
                        <input v-model="name" type="text" required placeholder="Введите имя работника" />
                    </div>

                    <div class="form-group">
                        <label>Цена или процент</label>
                        <CustomSelect :options="options" :selected="summaType" placeholder="Выберите рабочий тариф" @input="summaType=$event"/>
                    </div>
                    <div class="form-group">
                        <label>{{summaType=='percent'?'Процент':'Цена'}}</label>
                        <input v-model="price" v-if="summaType=='price'" placeholder="Введите цена " />
                        <input v-model="percent" v-if="summaType=='percent'" placeholder="Введите процент" />
                    </div>
                    <div class="form-group" v-if="!oneWorker">
                        <label>Первоначальный взнос</label>
                        <input type="number" v-model="totalCash" placeholder="Введите цена или процент" />
                    </div>
                </form>
                <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
                <div class="modal-buttons gap24 d-flex j-end a-center p-12">
                    <button type="button" class="action-button" @click="closeModal">Отмена</button>
                    <button
                        type="button"
                        class="action-button"
                        @click="handleSubmit"
                    >
                        {{ oneDebts ? 'Сохранить' : 'Создать' }}
                    </button>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
import { ipcRenderer } from 'electron';
import eventNames from '@/universal/eventNames';
import CustomSelect from '../components/CustomSelect.vue';

export default {
    props: {
        open: {
            type: Boolean,
            default: false,
        },
        oneWorker:{
            type:Object,
            default:null
        }
    },
    components: {
        CustomSelect
    },
    data() {
        return {
            id: null, 
            name: '',
            price: '',
            percent:"",
            summaType:'price',
            totalCash:'',
            errorMessage: '',
            options:[
                    {
                        text:"Процент",
                        value:'percent'
                    },
                    {
                        text:"Цена",
                        value:'price'
                    }
                ],
        };
    },
    watch: {
        oneWorker: {
            immediate: true, 
            handler(newVal) {
                if (newVal) {
                    this.id = newVal._id || null; 
                    this.name = newVal.name || '';
                    this.summaType=newVal.summaType||'price'
                    this.price = newVal.price || '';
                    this.percent = newVal.percent || '';
                }
            },
        },
    },
    methods: {
        closeModal() {
            this.$emit('close');
        },
        handleData(data) {
            this.date = data;
        },
        async handleSubmit() {
            if (!this.name ||!this.summaType) {
                this.errorMessage = 'Пожалуйста, заполните все обязательные поля';
                return;
            }

            const payload = {
                name: this.name,
                summaType: this.summaType,
                price: this.price || 0,
                percent: this.percent,
                totalCash: this.totalCash,
            };

            if (this.oneWorker) {
                
                await ipcRenderer.invoke(eventNames.UpdateWorkerEvent, JSON.parse(JSON.stringify({...payload, id:this.id}))).then(
                    (res) => {
                        if(res.status==200){
                            this.$emit('status', {status:200,message:"Платеж успешно изменен"})
                        }
                        else{
                            this.$emit('status', {status:400,message:"Ошибка изменения платежа"})
                        }
                    }
                );
            } else {
                await ipcRenderer.invoke(eventNames.createWorkerEvent, JSON.parse(JSON.stringify(payload))).then(
                    (res) => {
                        if(res.status==201){
                            this.$emit('status', {status:201,message:"Платеж успешно добавлен"})
                        }
                        else{
                            this.$emit('status', {status:401,message:"Ошибка добавления платежа"})
                        }
                    }
                );
            }
            this.resetForm();
            this.closeModal();
        },
        resetForm() {
            this.id = null;
            this.reason = '';
            this.date = '';
            this.price = '';
            this.description = '';
            this.worker = '';
            this.errorMessage = '';
        },
    },
};
</script>
