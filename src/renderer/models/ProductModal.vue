<template>
    <transition name="slide-modal">
        <div v-if="open" class="modal">
            <div class="modal-content">
                <h2 class="modal-title p-12">
                    {{ product ? "Редактирование заказа" : "Добавить новый заказ" }}
                </h2>
                <form v-if="!loading2" class="scroll">
                    <div class="modal-form">
                        <div class="form-group">
                            <label>Имя клиента</label>
                            <input type="text" v-model="formData.clientName" required
                                placeholder="Введите имя клиента" />
                        </div>
                        <div class="form-group">
                            <label>Номер телефона клиента</label>
                            <input type="text" placeholder="Введите номер клиента" v-model="formData.phone" required />
                        </div>
                        <div class="form-group">
                            <label>Адрес клиента</label>
                            <input type="text" placeholder="Введите адрес клиента" v-model="formData.address"
                                required />
                        </div>

                        <!-- Conditional Rendering of CustomSelect -->
                        <div class="form-group" v-if="summaType.length > 0">
                            <label>Метод оплаты</label>
                            <CustomSelect :options="summaType" placeholder="Выберите метод оплаты"
                                :selected="formData?.paymentMethod" @input="formData.paymentMethod = $event" />
                        </div>

                        <!-- Conditional Rendering of DatePicker -->
                        <div class="form-group" v-if="formData.startDate != null">
                            <label>Дата получения заказа</label>
                            <DatePicker :writeDay="formData.startDate" placeholder="Выберите дату начала"
                                class="relative border9 radius1 p10 gray text16"
                                @dateSelected="handleData($event, 'start')" />
                        </div>

                        <!-- Conditional Rendering of DatePicker -->
                        <div class="form-group" v-if="formData.endDate != null">
                            <label>Дата доставки заказа</label>
                            <DatePicker :writeDay="formData.endDate" placeholder="Выберите дату окончания"
                                class="border9 relative radius1 p10 gray text16"
                                @dateSelected="handleData($event, 'end')" />
                        </div>

                        <!-- Conditional Rendering of CustomSelect for Status -->
                        <div class="form-group" v-if="options.length > 0">
                            <label>Статус</label>
                            <CustomSelect :options="options" :selected="formData?.status" placeholder="Выберите статус"
                                @input="formData.status = $event" />
                        </div>

                        <!-- Conditional Rendering of ClientSelect -->
                        <div class="form-group" v-if="formData.workers">
                            <label>Работник</label>
                            <ClientSelect :activeWorker="formData?.workers" placeholder="Выберите работника"
                                @input="formData.workers = $event" />
                        </div>
                        <div class="form-group" v-else>
                            <label>Работник</label>
                            {{ formData?.workers }}
                            <ClientSelect :activeWorker="formData?.workers" placeholder="Выберите работника"
                                @input="formData.workers = $event" />
                        </div>
                    </div>
                    <div class="form-groups">
                        <div v-for="(product, index) in formData?.products" :key="index" class="product-item d-flex">
                            <div class="form-groun">
                                <label>Название продукта</label>
                                <CustomSelect :search="true" :options="myProduct" placeholder="Выберите продукт"
                                    @input="handleProductChange($event, index)" :selected="product?.id" />
                            </div>
                            <div class="form-groun">
                                <label>Цена продукта</label>
                                <input type="number" v-model="product.price" @input="handlePriceChange(index)"
                                    placeholder="Введите цену продукта" required />
                            </div>
                            <div class="form-groun">
                                <label>Количество</label>
                                <input type="number" v-model="product.quantity" placeholder="Введите количество"
                                    required />
                            </div>
                        </div>
                        <div class="border-bottom"></div>
                        <div class="modal-button d-flex p12 j-end gap12">
                            <button type="button" v-if="formData.products.length > 1" class="action-button"
                                @click="removeProduct(index)">
                                Удалить продукт
                            </button>
                            <button type="button" class="action-button" @click="addProduct">Добавить продукт</button>
                        </div>
                    </div>

                    <div class="d-flex j-between">
                        <div class="form-groun">
                            <label for="">Общая цена</label>
                            <input type="text" :value="totalPrice" readonly />
                        </div>
                        <div class="form-groun">
                            <label for="">Авансы</label>
                            <input type="number" v-model="formData.avans" placeholder="Введите аванс" />
                        </div>
                        <div class="form-groun">
                            <label for="">Остальные</label>
                            <input type="text" :value="qoldiq" readonly />
                        </div>
                    </div>
                </form>

                <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
                <div class="modal-buttons gap24 d-flex j-end a-center p-12">
                    <button type="button" class="action-button" @click="closeModal">Отмена</button>
                    <button type="button" class="action-button" :disabled="isSubmitting"
                        :class="{ 'is-disabled': isSubmitting }" @click="handleSubmit">
                        {{ product ? "Сохранить" : "Создать" }}
                    </button>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
import { ipcRenderer } from "electron";
import DatePicker from "../components/DatePicker.vue";
import CustomSelect from "../components/CustomSelect.vue";
import eventNames from "@/universal/eventNames";
import ClientSelect from "../components/ClientSelect.vue";

export default {
    props: {
        open: Boolean,
        product: {
            type: Object,
            default: () => ({}),
        },
    },
    components: {
        DatePicker,
        CustomSelect,
        ClientSelect,
    },
    data() {
        return {
            loading: true,
            loading2: false,
            isSubmitting: false,
            manuallyUpdatedPrices: [],
            isRestored:null,
            isArchive:null,
            formData: {
                clientName: "",
                phone: "",
                products: [
                    {
                        id: "",
                        price: 0,
                        quantity: 1,
                    },
                ],
                startDate: "",
                endDate: "",
                address: "",
                status: "",
                price: null,
                avans: null,
                qoldiq: null,
                workers: null,
                paymentMethod: ''
            },
            id: "",
            options: [
                { text: "Заказ принить", value: "Заказ принить" },
                { text: "Дизайн заказа", value: "Дизайн заказа" },
                { text: "Заказ передан", value: "Заказ передан" },
                { text: "Сборка заказа", value: "Сборка заказа" },
            ],
            summaType: [
                { text: 'Наличные', value: 'Наличные' },
                { text: 'Карта', value: 'Карта' },
                { text: 'Банковский перевод', value: 'Банковский перевод' },
            ],
            errorMessage: null,
            myProduct: []
        };
    },
    computed: {
        totalPrice() {
            return this.formData.products.reduce(
                (sum, product) => sum + (product.price * product.quantity),
                0
            );
        },
        qoldiq() {
            const avans = Number(this.formData.avans || 0);
            return Math.max(0, this.totalPrice - avans);
        }
    },
    watch: {
        totalPrice(newValue) {
            this.formData.price = newValue;
        },
        qoldiq(newValue) {
            this.formData.qoldiq = newValue;
        },
        'formData.avans'(newValue) {
            this.formData.qoldiq = Math.max(0, this.totalPrice - (Number(newValue) || 0));
        },
        'formData.products'() {
            this.formData.price = this.totalPrice;
        },
        product: {
            immediate: true,
            deep: true,
            async handler(newVal) {
                if(newVal){
                        this.options= [
                { text: "Заказ принить", value: "Заказ принить" },
                { text: "Дизайн заказа", value: "Дизайн заказа" },
                { text: "Заказ передан", value: "Заказ передан" },
                { text: "Сборка заказа", value: "Сборка заказа" },
                { text: "Заказ оплачен", value: "Заказ оплачен" },
            ]
                }   
                if(newVal?.isArchive){
                    this.isArchive=true
                    this.options= [
                    { text: "Заказ возвращен", value: "Заказ возвращен" },
                    { text: "Заказ оплачен", value: "Заказ оплачен" },
                ]}
                if (newVal && newVal._id) {
                    this.loading2 = true
                    this.id = newVal._id;
                    this.formData = {
                        clientName: newVal.clientName,
                        phone: newVal.phone,
                        products: newVal.products ? await newVal.products.map((e) => ({
                            id: e.productId,
                            price: e.price,
                            quantity: e.quantity,
                        })) : [
                            {
                                id: "",
                                price: 0,
                                quantity: 1,
                            },
                        ],
                        startDate: newVal.startDate,
                        endDate: newVal.startDate,
                        address: newVal.address,
                        status: newVal.status,
                        price: newVal.price,
                        avans: newVal.avans,
                        qoldiq: newVal.qoldiq,
                        workers: newVal.workers ? await newVal.workers.map((e) => (e._id)) : '',
                        paymentMethod: newVal.paymentMethod
                    }
                    this.loading2 = false
                } else {
                    this.resetForm();
                }
            },
        },

    },
    methods: {
        handleProductStatus(event) {
            this.formData.status = event;
        },
        handleProductChange(productId, index) {
            const selectedProduct = this.myProduct.find(p => p.value === productId);
            if (selectedProduct) {
                this.formData.products[index].id = productId;

                if (!this.manuallyUpdatedPrices[index]) {
                    this.formData.products[index].price = selectedProduct.price || 0;
                }
            }
        },
        handlePriceChange(index) {
            this.manuallyUpdatedPrices[index] = true;
        },
        closeModal() {
            this.$emit("close");
            this.resetForm();
        },
        resetForm() {
            this.formData = {
                clientName: "",
                phone: "",
                products: [
                    {
                        id: "",
                        price: 0,
                        quantity: 1,
                    },
                ],
                startDate: "",
                endDate: "",
                address: "",
                status: "",
                avans: null,
                workers: null,
            };
            this.errorMessage = null;
        },
        handleData(event, value) {
            if (value === "start") {
                this.formData.startDate = event;
            } else {
                this.formData.endDate = event;
            }
        },
        addProduct() {
            this.formData.products.push({
                id: "",
                price: 0,
                quantity: 1,
            });
            this.manuallyUpdatedPrices.push(false); // Сбрасываем флаг для нового продукта
        },
        removeProduct(index) {
            if (this.formData.products.length > 1) {
                this.formData.products.splice(index, 1);
                this.manuallyUpdatedPrices.splice(index, 1); // Удаляем соответствующий флаг
            } else {
                this.errorMessage = "Kamida bitta mahsulot kiritilishi kerak.";
            }
        },
        async handleSubmit() {
            if (Number(this.formData.avans) < 0) {
                this.errorMessage = "Аванс не может быть отрицательным.";
                return;
            }

            if (new Date(this.formData.endDate) < new Date(this.formData.startDate)) {
                this.errorMessage = "Дата окончания не может быть раньше даты начала.";
                return;
            }
            if(!this.formData?.workers){
                this.errorMessage = "Выберите специалиста";
                return;
            }

            for (const product of this.formData.products) {
                if (product.price <= 0 || product.quantity <= 0) {
                    this.errorMessage = "Все поля продукта должны быть заполнены.";
                    return;
                }
            }

            const dataToSend = this.product
                ? { ...this.formData, id: this.id }
                : this.formData;
            let event=null
            if(this.product&&this.isArchive){
                event=eventNames.exitArchiveEvent
            }
            else if(this.product){
                event = eventNames.updateOrderEvent
            }
            else{
                event= eventNames.createOrderEvent
            }
            try {
                this.isSubmitting = true
                const res = await ipcRenderer.invoke(event, JSON.parse(JSON.stringify(dataToSend)));
                this.isSubmitting = false
                console.log(res);
                if (res.status === 201 || res.status === 200) {
                    this.closeModal();
                    this.$emit("status", {
                        status: "success",
                        message: "Заказ успешно сохранён.",
                    });
                } else {
                    this.errorMessage = res.message || "Ошибка сервера. Попробуйте ещё раз.";
                }
            } catch (error) {
                this.errorMessage = "Ошибка соединения. Попробуйте позже.";
            }
        },
        async allMyProduct() {
            const res = await ipcRenderer.invoke(eventNames.listMyProductEvent, {});
            if (res?.status === 200) {
                console.log(res);
                this.myProduct = res.data.map(res => ({ text: res.title, value: res._id, price: res.price }));
            }
        },

    },
    mounted() {
        this.allMyProduct();
    },
};
</script>

<style>
.form-groups {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.product-item {
    display: flex;
    justify-content: space-between;
}

.form-groun {
    width: 32%;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.form-groun>label {
    font-size: 14px;
    color: #919eAD;
}

.form-groun>input {
    width: 100%;
    border: 1px solid #ddd;
    padding: 12px;
    border-radius: 8px;
}

.modal-button>button {
    padding: 8px 24px;
    color: #fff;
    cursor: pointer;
}

.modal-button>button:first-child {
    background-color: #ff4d4d;
}

.modal-button>button:last-child {
    background-color: #4d79ff;
}

.error-message {
    color: red;
    margin: 10px 0;
}

.action-button.is-disabled {
    background-color: #d6d6d6 !important;
    color: #999999 !important;
    cursor: not-allowed;
}
</style>
