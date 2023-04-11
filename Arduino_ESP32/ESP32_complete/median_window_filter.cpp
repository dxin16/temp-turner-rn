#include "median_window_filter.h"

int filter_window_median(int window_chron[], int window_sort[], int window_size) {
  memcpy(window_sort, window_chron, window_size * sizeof(*window_chron));
  qsort(window_sort, window_size, sizeof(*window_chron), &compare_ints);
  return window_sort[window_size / 2 + 1];
}

static int compare_ints(const void* n_0, const void* n_1) {
  return (*(int*)n_0) - (*(int*)n_1);
}