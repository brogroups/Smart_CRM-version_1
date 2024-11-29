<template>
    <div class="page product gap24 d-flex column">
        <div class="product-top d-flex j-between a-center">
            <h2 class="page-title">Фирмы</h2>
            <div class="cascad d-flex a-center gap12">
                <CustomSelect 
                    :options="allOptions" 
                    class="w-33" 
                    placeholder="Выбирать"
                    v-model="selectedFilter"
                />
                <div class="border2 d-flex a-center gap6 p-0-12 gap12 radius1">
                    <Icons name="search" />
                    <input 
                        type="text" 
                        class="worker-search" 
                        placeholder="Поиск специалист" 
                        @input="searchFirma($event.target.value)" 
                    />
                </div>
                <div class="d-flex gap12">
                    <div class="create-button" @click="isManyOpen=true">Покупка продукта</div>
                    <button @click="handleOpen" class="create-button">Создать фирму</button>
                </div>
                
            </div>
        </div>
        <div class="product-bottom page-bottom">
            <table>
                <thead>
                    <tr>
                        <th>Наз/фирмы</th>
                        <th>Имя менеджера</th>
                        <th>Телефон</th>
                        <th>Адрес</th>
                        <th>Об/долг</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="data in filteredProduct" :key="data._id" @dblclick="handleOpenOneProduct(data?._id)">
                        <td>{{ data?.firma }}</td>
                        <td>{{ data?.manager }}</td>
                        <td>{{ data?.phone }}</td>
                        <td>{{ data?.address }}</td>
                        <td>{{ data.debts < 0 ? '+' : '-' }}{{ formatSumma(Math.abs(data?.debts)) }}</td>
                        <td class="d-flex gap12 a-center j-end">
                            <Icons name="payed" class="icon info" @click="handlePay(data._id)" />
                            <Icons name="edit" class="icon info" @click="handleEdit(data)" />
                            <Icons name="deleted" class="icon danger" @click="handleDelete(data?._id)"/>
                            <Icons name="rightArrow" @click="handleOpenOneProduct(data?._id)" />
                        </td>
                    </tr>
                </tbody>
            </table>
            <div v-if="!filteredProduct.length" class="d-flex j-center p12 text16">Партнеров пока нет</div>
        </div>
    </div>
    <RequiredModal :isVisible="visible"  @response="handleResponse($event)" />
    <FirmaCreate @status="handleStatus($event)" :open="isOpen" :oneFirma="selectedFirma" @close="handleClose" @updateList="FirmaList" />
    <Toastiff :toastOptions="toastOptions" />
    <PayedForFirma :open="isPay" :firmId="currentPay" @close="handleClose" @status="handleStatus($event)"/>
    <SaleMany :open="isManyOpen" @close="isManyOpen=false" :firmaIdsi="firma" @status="handleStatus($event)"/>
</template>

<script>
import CustomSelect from '../components/CustomSelect.vue';
import Icons from '../components/Icons.vue';
import { ipcRenderer } from 'electron';
import eventNames from '../../universal/eventNames';
import FirmaCreate from '../models/FirmaCreate.vue';
import RequiredModal from '../components/requiredModal.vue';
import Toastiff from '../utils/Toastiff.vue';
import PayedForFirma from '../models/PayedForFirma.vue';
import SaleMany from '../utils/SaleMany.vue';

export default {
    name: "ProductPage",
    emits: ['viewFirma'],
    components: {
        CustomSelect,
        Icons,
        FirmaCreate,
        RequiredModal,
        Toastiff,
        PayedForFirma,
        SaleMany
    },
    data() {
        return {
            allOptions: [
                { text: 'День', value: 'day' },
                { text: 'Цена', value: 'price' },
            ],
            selectedFilter: null,
            isPay:false,
            isOpen: false,
            selectedFirma: null,
            allProduct: [],
            filteredProduct: [],
            visible: false,
            currentFirma: '',
            currentPay:null,
            isManyOpen:false,
            toastOptions: {
                open: false,
                text: "",
                style: { background: "#4CAF50" }
            },
        };
    },
    methods: {
        handleOpen() {
            this.selectedFirma = null; 
            this.isOpen = true;
        },
        handleClose() {
            this.isOpen = false;
            this.isPay=false
        },
        handleEdit(firma) {
            this.selectedFirma = firma; 
            this.isOpen = true;
        },
        handleDelete(id) {
            this.currentFirma = id;
            this.visible = true;
        },
        handleResponse(event) {
            this.visible = false;
            if (event === true) {
                this.deleteFirma();
            }
        },
        handlePay(id){
            this.currentPay=id
            this.isPay=true
        },
        handleStatus(event) {
            this.FirmaList();
            this.isManyOpen=false
            if (event?.status == 200 || event?.status == 201) {
                this.showToast(event?.message, '#4CAF50');
            } else {
                this.showToast(event?.message, '#FF5252');
            }
        },
        async deleteFirma() {
            try {
                const res = await ipcRenderer.invoke(eventNames.deleteFirmaEvent, { id: this.currentFirma });
                console.log(res);
                if (res.status == 200) {
                    this.FirmaList();
                    this.showToast('Фирма успешно удалена!', '#4CAF50');
                }
            } catch (err) {
                this.showToast(`Ошибка при удалении фирмы: ${err.message || 'Неизвестная ошибка'}`, '#FF5252');
            }
        },
        handleOpenOneProduct(id) {
            this.$emit('viewFirma', id);
        },
        searchFirma(keyword) {
            this.filteredProduct = this.allProduct.filter(product =>
                product.firma.toLowerCase().includes(keyword.toLowerCase()) ||
                product.manager.toLowerCase().includes(keyword.toLowerCase()) ||
                product.phone.includes(keyword) ||
                product.address.toLowerCase().includes(keyword.toLowerCase())
            );
        },
        handleFilter() {
            const selectedOption = this.selectedFilter;
            if (selectedOption === 'day') {
                this.filteredProduct.sort((a, b) => new Date(a.date) - new Date(b.date));
            } else if (selectedOption === 'price') {
                this.filteredProduct.sort((a, b) => a.debts - b.debts);
            }
        },
        formatSumma(summa) {
            return new Intl.NumberFormat('ru-RU').format(summa);
        },
        async FirmaList() {
            try {
                const res = await ipcRenderer.invoke(eventNames.listFirmaEvent, {});
                this.allProduct = res?.data || [];
                this.filteredProduct = this.allProduct; // Default filtered data
            } catch (err) {
                this.showToast(`Ошибка при загрузке фирм: ${err.message || 'Неизвестная ошибка'}`, '#FF5252');
            }
        },
        showToast(message, background) {
            this.toastOptions = {
                open: true,
                text: message,
                style: { background }
            };
        },
    },
    watch: {
        selectedFilter: "handleFilter",
        allProduct: {
            handler(val) {
                this.filteredProduct = val;
            },
            immediate: true
        }
    },
    mounted() {
        this.FirmaList();
    },
};
</script>

<style>
.cascad{
    width: 100%;
    display: flex;
    width: 80%;
}
.page-search {
    border: 1px solid #919191;
    border-radius: 8px;
    width: 30%;
    height: 40px;
}
</style>
