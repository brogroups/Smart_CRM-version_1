<template>
    <transition name="slide-modal">
        <div v-if="open" class="modal">
            <div class="modal-content">
                <h2 class="modal-title p-12">
                    {{ initialData ? 'Редактирование закупки' : 'Добавить закупку' }}
                </h2>
                <form class="modal-form">
                    <div class="form-group">
                        <label>Название товара</label>
                        <input v-model="currentProduct.name" type="text" required
                            placeholder="Введите название товара" />
                    </div>
                    <div class="form-group">
                        <label>Цена за единицу</label>
                        <input v-model="currentProduct.price" type="number" required
                            placeholder="Введите цену за единицу" />
                    </div>
                    <div class="form-group">
                        <label>Количество</label>
                        <input v-model="currentProduct.quantity" type="number" required
                            placeholder="Введите количество" />
                    </div>
                    <div class="form-group">
                        <label>Общая цена</label>
                        <input :value="calculateTotalPrice(currentProduct.price, currentProduct.quantity)" type="text"
                            disabled placeholder="Общая цена рассчитывается автоматически" />
                    </div>
                </form>
                <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
                <div class="modal-buttons gap24 d-flex j-end a-center p-12">
                    <button type="button" class="action-button" @click="closeModal">Отмена</button>
                    <button type="button" class="action-button" @click="handleSubmit" 
                    :disabled="isSubmitting" :class="{ 'is-disabled': isSubmitting }">
                        {{ editMode ? 'Сохранить' : 'Добавить' }}
                    </button>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
import { ipcRenderer } from 'electron';
import eventNames from '@/universal/eventNames';

export default {
    props: {
        open: {
            type: Boolean,
            default: false,
        },
        editMode: {
            type: Boolean,
            default: false,
        },
        initialData: {
            type: Object,
            default: null,
        },
        firmaId: String,
    },
    data() {
        return {
            currentProduct: {
                name: '',
                price: 0,
                quantity: 0,
            },
            id: '',
            errorMessage: '',
            isSubmitting:false
        };
    },
    watch: {
        initialData: {
            immediate: true,
            handler(newVal) {
                console.log(newVal, 'suck');
                if (newVal) {
                    console.log(newVal);
                    this.id = newVal
                    this.currentProduct = {
                        name: newVal?.name,
                        price: newVal?.price,
                        quantity: newVal.quantity
                    }
                }
            },
        },
    },
    methods: {
        closeModal() {
            this.$emit('close');
        },
        calculateTotalPrice(price, quantity) {
            return (price * quantity);
        },
        async handleSubmit() {
            this.errorMessage = '';
            if (!this.currentProduct.name || !this.currentProduct.price || !this.currentProduct.quantity) {
                this.errorMessage = 'Заполните все поля для текущего товара перед добавлением нового.';
                return;
            }

            const payload = {
                ...this.currentProduct, totalPrice: Number(this.currentProduct.price) * Number(this.currentProduct.quantity),
                firmaId: this.firmaId,
            };

            this.isSubmitting=true
            try {
                if (this.initialData) {
                    await ipcRenderer.invoke(eventNames.updateSalesEvent, JSON.parse(JSON.stringify({...payload,id:this.id})))
                        .then((res) => {
                            this.isSubmitting=false

                            if (res.status == 200) {
                                this.$emit('status', 'success')
                            }
                        })
                } else {
                    await ipcRenderer.invoke(eventNames.createOneSalesEvent, JSON.parse(JSON.stringify(payload)))
                        .then((res) => {
                            this.isSubmitting=false
                            if (res.status == 201) {
                                this.$emit('status', 'success')
                            }
                        })
                }
                this.resetForm();
                this.closeModal();
            } catch (error) {
                console.error('Error while saving:', error);
                this.errorMessage = 'Ошибка при сохранении данных.';
            }
        },
        resetForm() {
            this.currentProduct = {
                name: '',
                price: 0,
                quantity: 0,
            };
            this.errorMessage = '';
        },
    },
};
</script>

<style scoped></style>
