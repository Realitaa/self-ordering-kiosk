export default defineAppConfig({
  ui: {
    colors: {
      neutral: "slate",
    },
    carousel: {
      slots: {
        dots: "absolute inset-x-0 bottom-3 flex flex-wrap items-center justify-center gap-3 h-3!",
        dot: [
          "cursor-pointer size-3 bg-accented/50 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          "transition",
        ],
      },
    },
    pageHeader: {
      slots: {
        root: 'relative border-b border-default pb-4',
      },
      variants: {
        title: {
          true: {
            description: 'mt-2'
          }
        }
      }
    },
    authForm: {
      slots: {
        leading: 'mb-3 flex justify-center gap-3'
      }
    }
  },
});
