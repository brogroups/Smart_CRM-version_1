<template>
    <transition class="slide-modal">
        <div class="modal" v-if="open">
            <div class="modal-content">
                <h2>Расходы продукта для заказа</h2>
                <div class="scroll form_modal">
                    <div class="form-groups">
                        <div v-for="(product, index) in products" :key="index" class="product-item d-flex">
                            <div class="form-groun">
                                <label for="">Продукт</label>
                                <CustomSelect :search="true" :options="allProduct"
                                    @input="updateProductPrice(index, $event)" placeholder="Выберите продукт" />
                            </div>
                            <div class="form-groun">
                                <label for="">Сумма</label>
                                <input type="number" v-model.number="product.price" placeholder="Введите сумму">
                            </div>
                            <div class="form-groun">
                                <label for="">Количество</label>
                                <input type="number" v-model.number="product.quantity" placeholder="Введите количество">
                            </div>
                        </div>
                        <div class="modal-button p12 gap12 d-flex j-end">
                            <button type="button" class="action-button" @click="removeProduct(index)">Удалить
                                продукт</button>
                            <button type="button" class="action-button" @click="addProduct">Добавить продукт</button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="">Общая сумма</label>
                        <input type="number" :value="totalPrice" readonly>
                    </div>
                </div>
                <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
                <div class="modal-buttons gap24 d-flex j-end a-center p-12">
                    <button type="button" class="action-button" @click="closeModal">Отмена</button>
                    <button type="button" class="action-button" @click="handleSubmit"
                    :disabled="isSubmitting" :class="{ 'is-disabled': isSubmitting }"
                    >
                        {{ oneDebts ? 'Сохранить' : 'Создать' }}
                    </button>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
import eventNames from '@/universal/eventNames';
import { ipcRenderer } from 'electron';
import CustomSelect from '../components/CustomSelect.vue';

export default {
    props: {
        open: Boolean,
        orderId: String
    },
    components: {
        CustomSelect
    },
    data() {
        return {
            allProduct: [],
            isSubmitting:false,
            products: [
                {
                    id: '',
                    price: 0,
                    quantity: 1
                }
            ],
            errorMessage: ''
        };
    },
    computed: {
        totalPrice() {
            return this.products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
        }
    },
    methods: {
        handleEvent(event) {
            console.log(event);
        },
        updateProductPrice(index, productId) {
        const selectedProduct = this.allProduct.find(product => product.value === productId);
        if (selectedProduct) {
            this.products[index].id = productId;
            this.products[index].price = selectedProduct.price; 
        }
    },
        async allSales() {
            await ipcRenderer.invoke(eventNames.listSalesEvent, {})
                .then((res) => {
                    console.log(res);
                    if (res.status === 200) {
                        this.allProduct = res?.sales?.map((e) => ({
                            text: `${e?.name} (${e?.firmaName})`,
                            value: e?._id,
                            price: e?.price
                        }));
                    }
                });
        },
        addProduct() {
            this.products.push({
                id: '',
                price: 0,
                quantity: 1
            });
        },
        removeProduct(index) {
            if (this.products.length > 1) {
                this.products.splice(index, 1);
            } else {
                this.errorMessage = 'Нельзя удалить последний продукт';
                setTimeout(() => this.errorMessage = '', 3000);
            }
        },
        async handleSubmit() {
            const product = {
                orderId: this.orderId,
                rasxodlar: this.products
            }
            this.isSubmitting=true
            console.log(product);
            await ipcRenderer.invoke(eventNames.oneOrderRasxodEvent, JSON.parse(JSON.stringify(product)))
                .then((res) => {
                    this.isSubmitting=false
                    console.log(res);
                    if(res.status==200){
                        this.$emit('status',{status:201})
                    }
                })
            console.log(this.products);
        },
        closeModal() {
            this.$emit('close')
        }
    },
    mounted() {
        this.allSales();
    }
};
</script>

<style scoped>
.product-item {
    border-bottom: 1px solid #ddd;
    padding: 0px 0px 12px;
}

.form_modal {
    height: 600px
}
</style>
