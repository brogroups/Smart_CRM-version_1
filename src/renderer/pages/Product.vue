<template>
    <div class="page product gap24 d-flex column">
        <div class="product-top w-100 d-flex j-between a-center">
            <h2 class="page-title">Клиенты</h2>
            <div class="page-top-buttons d-flex a-center gap12 j-between">
                <CustomSelect :options="allOptions" class="w-33" placeholder="Выбирать" @input="handleSelect($event)" />
                <div class="border2 d-flex a-center gap6 p-0-12 gap12 radius1">
                    <Icons name="search" />
                    <input type="text" class="worker-search" placeholder="Поиск специалист"
                        @input="searchProduct($event.target.value)" />
                </div>
                <button @click="handleOpen" class="create-button">Создать продукт</button>
            </div>
        </div>
        <div class="relative product-bottom page-bottom scroll ">
            <table>
                <thead>
                    <tr>
                        <th>Имя клиента</th>
                        <th>Цена</th>
                        <th>Аванс</th>
                        <th>Остальные</th>
                        <th>Время/нач</th>
                        <th>Срок</th>
                        <th>Статус</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="data in filteredProducts" :key="data.index" @dblclick="handleOpenOneProduct(data._id)">
                        <td>{{ data?.clientName }}</td>
                        <td>{{ formatSumma(data?.price) }}</td>
                        <td>{{ formatSumma(data?.avans) }}</td>
                        <td>{{ formatSumma(data?.qoldiq) }}</td>

                        <td>{{ formatDate(data?.startDate) }}</td>
                        <td>{{ formatDate(data?.endDate) }}</td>
                        <td>{{ data?.status }}</td>
                        <td class="d-flex gap12 a-center">
                            <Icons name="payed" class="icon info" @click="payedAvans(data)" />
                            <Icons name="edit" class="icon info" @click="editProduct(data._id)" />
                            <Icons name="deleted" class="icon danger" @click="deleteOpenReq(data._id)" />
                            <Icons name="rightArrow" @click="handleOpenOneProduct(data._id)" />
                        </td>
                    </tr>
                </tbody>
            </table>
            <div v-if="!filteredProducts.length" class="d-flex j-center p12 text16">Товаров пока нет</div>
        </div>
    </div>
    <ProductModal :open="isOpen" @close="handleClose" @status="handleStatus($event)" :product="product" />
    <RequiredModal :isVisible="visible" @response="handleResponse($event)" />
    <Toastiff :toastOptions="toastOptions" />
    <AvansModal :open="openAvans" :payed="payedProduct" @close="openAvans = false" />
</template>

<script>
import CustomSelect from '../components/CustomSelect.vue';
import Icons from '../components/Icons.vue';
import ProductModal from '../models/ProductModal.vue';
import { ipcRenderer } from 'electron';
import eventNames from '../../universal/eventNames';
import RequiredModal from '../components/requiredModal.vue';
import Toastiff from '../utils/Toastiff.vue';
import AvansModal from '../models/AvansModal.vue';

export default {
    name: "ProductPage",
    emits: ['viewProduct'],
    components: {
        CustomSelect,
        Icons,
        ProductModal,
        RequiredModal,
        Toastiff,
        AvansModal
    },
    data() {
        return {
            allOptions: [
                { text: 'День', value: 'day' },
                { text: 'Цена', value: 'price' },
            ],
            selectedFilter: null,
            isOpen: false,
            openAvans: false,
            allProduct: [],
            filteredProducts: [],
            visible: false,
            currentId: null,
            toastOptions: {
                open: false,
                text: "",
                style: { background: "#4CAF50" },
            },
            product: null,
            isLoading: true,
            payedProduct: {},
        };
    },
    methods: {
        handleOpen() {
            this.isOpen = true;
            this.product=null
        },
        handleOpenOneProduct(id) {
            this.$emit('viewProduct', id);
        },
        handleResponse(event) {
            this.visible = false;
            if (event == true) {
                this.deleteProduct();
            }
        },
        payedAvans(avans) {
            this.openAvans = true

            this.payedProduct = {
                _id: avans?._id,
                qoldiq: avans?.qoldiq
            }
        },
        deleteOpenReq(id) {
            this.currentId = id;
            this.visible = true;
        },
        formatDate(date) {
            return new Date(date).toLocaleDateString("ru-RU");
        },
        formatSumma(summa) {
            return new Intl.NumberFormat("ru-RU").format(summa);
        },
        async editProduct(data) {
             await ipcRenderer.invoke(eventNames.OneProductEvent,{id:data})
             .then((res)=>{
                console.log(res);
                if(res?.status==200){
                    this.product=res?.data
                    this.isOpen = true;
                }
             })
        },  

        handleClose() {
            this.isOpen = false;
        },
        handleSelect(event) {
            this.selectedFilter = event
        },
        handleStatus(event) {
            if (event.status === 'success') {
                this.listAllProduct();
                this.toastOptions = {
                    open: true,
                    text: "Операция выполнена успешно.",
                    style: { background: "#4CAF50" },
                };
            } else {
                this.toastOptions = {
                    open: true,
                    text: "Произошла ошибка, попробуйте снова.",
                    style: { background: "#F44336" },
                };
            }
        },
        searchProduct(keyword) {
            this.filteredProducts = this.allProduct.filter(product =>
                product.clientName.toLowerCase().includes(keyword.toLowerCase()) ||
                product.productName.toLowerCase().includes(keyword.toLowerCase()) ||
                product.phone.includes(keyword) ||
                product.address.toLowerCase().includes(keyword.toLowerCase())
            );
        },
        handleFilter() {
            if (this.selectedFilter == 'day') {
                this.filteredProducts.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
            } else if (this.selectedFilter == 'price') {
                this.filteredProducts.sort((a, b) => b.price - a.price);
            }
        },
        async deleteProduct() {
            try {
                const res = await ipcRenderer.invoke(eventNames.deleteOrderEvent, { id: this.currentId });
                if (res.status == 200) {
                    this.toastOptions = {
                        open: true,
                        text: "Продукт успешно удалён.",
                        style: { background: "#4CAF50" },
                    };
                    await this.listAllProduct();
                }
            } catch (error) {
                this.toastOptions = {
                    open: true,
                    text: "Ошибка при удалении продукта.",
                    style: { background: "#F44336" },
                };
            }
        },
        async listAllProduct() {
            try {
                this.isLoading = true;
                const res = await ipcRenderer.invoke(eventNames.listOrderEvent, {});
                if (res.status == 200) {
                    this.allProduct = res?.data || [];
                    this.filteredProducts = this.allProduct;
                }
            } catch (error) {
                this.toastOptions = {
                    open: true,
                    text: "Ошибка при загрузке списка продуктов.",
                    style: { background: "#F44336" },
                };
            } finally {
                this.isLoading = false;
            }
        },
    },
    watch: {
        selectedFilter: "handleFilter",
    },
    mounted() {
        this.listAllProduct();
    },
};
</script>

<style>
.page-search {
    border: 1px solid #919191;
    border-radius: 8px;
    width: 33%;
    height: 40px;
}
</style>
