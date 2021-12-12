<template>
  <div>
    <div class="q-pa-md">
      <div v-if="islogin">
        <q-card flat bordered class="q-mt-md">
          <q-card-section>
            <div class="my-comment">
              <q-input
                v-if="mypostform.text == ''"
                label="填写您的评论并在下方进行评分（友善的反馈是交流的起点）"
                class="text-area-control text-h6"
                v-model="mypostform.text"
                type="textarea"
                borderless
              />
              <q-input
                v-else
                class="text-area-control"
                style="font-size: 15px"
                v-model="mypostform.text"
                type="textarea"
                borderless
              />
            </div>
            <q-separator />
          </q-card-section>
          <q-card-section class="q-pt-none">
            <q-rating
              icon-selected="star"
              icon-half="star_half"
              v-model="mypostform.ratingpost"
              size="25px"
              :max="5"
              color="primary"
            />
          </q-card-section>
          <q-separator />

          <q-card-section>
            <q-btn
              @click="SubmitMyViwer"
              :disable="!islogin"
              color="primary"
              label="提交评价"
            />
          </q-card-section>
        </q-card>
        <q-separator />
      </div>

      <q-card v-else flat bordered class="q-mt-md">
        <q-card-section>
          <div class="my-comment">
            <q-input
              v-if="mypostform.text == ''"
              label="请先登陆再进行评价"
              type="textarea"
              borderless
              disable
            />
          </div>
          <q-separator />
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-rating size="20px" :max="5" color="primary" disable />
        </q-card-section>
      </q-card>
      <q-card flat bordered style="margin-top: 20px">
        <q-expansion-item
          switch-toggle
          default-opened
          icon="chat"
          label="用户评价"
        >
          <q-card v-if="userscorelist.length != 0">
            <div v-for="(item, index) in userscorelist" :key="index">
              <div style="margin-left: 10px; margin-bottom: 5px" class="flex">
                <q-avatar size="40px">
                  <img :src="item.avatar" />
                </q-avatar>
                <div style="flex: 1 1 0; padding-left: 15px">
                  <div class="flex items-center">
                    <span style="color: #1a73e8; min-width: 60px">{{
                      item.username
                    }}</span>
                    <span style="padding-left: 15px">{{
                      item.createtime
                    }}</span>

                    <q-rating
                      style="padding-left: 5px"
                      readonly
                      :value="item.score"
                      size="16px"
                      :max="5"
                      color="primary"
                    />
                  </div>
                  <div>
                    <pre>{{ item.message }}</pre>
                  </div>
                </div>
              </div>
              <q-separator style="margin-bottom: 5px" />
            </div>
          </q-card>

          <div v-else style="margin: 15px">暂无用户评论，您可以来当第一位</div>
        </q-expansion-item>
      </q-card>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useStore } from 'src/store';
import { useRoute } from 'vue-router';
import { submitComment, getAllScroe, getMyScore } from 'src/apis/comment';

export default defineComponent({
  meta() {
    return {
      title: '评论',
    };
  },
  setup() {
    const mypostform = ref({
      ratingpost: 0,
      text: '',
    });
    const userscorelist = ref(<DTO.CommentList[]>[]);
    const store = useStore();
    const route = useRoute();

    const islogin = computed(() => {
      return store.state.user.islogin;
    });
    const user = computed(() => {
      return store.state.user.user;
    });
    const id = computed(() => {
      return route.params.id;
    }).toString();

    const SubmitMyViwer = () => {
      submitComment(id, {
        score: mypostform.value.ratingpost * 10,
        message: mypostform.value.text,
      })
        .then((response) => {
          if (response.data.code === 0) {
            // this.$q.notify({
            //   message: '提交成功！',
            //   position: 'center',
            //   icon: 'tag_faces',
            //   color: 'primary',
            // });
            // this.getallscroe(1);
          }
        })
        .catch((error) => {
          console.log(error);
          // this.$q.notify({
          //   position: 'center',
          //   message: '评分和评论都是必填项！',
          //   icon: 'error',
          //   color: 'red',
          // });
        });
    };
    getAllScroe(id, 1, 20)
      .then((response) => {
        if (response.data.code === 0) {
          for (let index = 0; index < response.data.list.length; index++) {
            if (response.data.list[index].avatar === '') {
              response.data.list[index].avatar =
                'https://scriptcat.org/api/v1/user/avatar/5';
            }
            response.data.list[index].score =
              response.data.list[index].score / 10;
            // response.data.list[index].createtime = this.$options.filters[
            //   'formatDate'
            // ](response.data.list[index].createtime, '年', '月', '日');
          }
          userscorelist.value = response.data.list;
        }
      })
      .catch((error) => {
        console.log(error);
      });
    getMyScore(id)
      .then((response) => {
        if (response.data.code === 0) {
          mypostform.value.ratingpost = response.data.data.score / 10;
          mypostform.value.text = response.data.data.message;
        }
      })
      .catch((error) => {
        console.log(error);
      });

    return {
      mypostform,
      userscorelist,
      islogin,
      user,
      SubmitMyViwer,
    };
  },
});
</script>

<style lang="scss" scoped></style>
