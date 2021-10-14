import { KdbxItemState } from "..";

/**
 * Interface to type the sort item state
 */
 export interface ISortMenuItem {
  id: number;
  displayName: string;
  compare: (a: KdbxItemState, b: KdbxItemState) => number;
}
