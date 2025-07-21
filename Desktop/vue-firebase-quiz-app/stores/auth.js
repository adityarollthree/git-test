import { defineStore } from "pinia";
import { onAuthStateChanged } from "firebase/auth";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const isAdmin = ref(false);
  const loading = ref(true);

  const { auth, checkIfAdmin } = useFirebase();

  const initAuth = () => {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          user.value = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          };

          // Check admin status
          isAdmin.value = await checkIfAdmin(firebaseUser.email);
        } else {
          user.value = null;
          isAdmin.value = false;
        }

        loading.value = false;
        resolve();
      });
    });
  };

  const refreshAdminStatus = async () => {
    if (user.value) {
      isAdmin.value = await checkIfAdmin(user.value.email);
    }
  };

  return {
    user: readonly(user),
    isAdmin: readonly(isAdmin),
    loading: readonly(loading),
    initAuth,
    refreshAdminStatus,
  };
});
