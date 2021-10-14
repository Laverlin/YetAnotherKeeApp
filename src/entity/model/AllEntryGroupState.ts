import { KdbxEntry, KdbxGroup } from "kdbxweb";
import { GlobalContext, KdbxItemState } from "..";

/**
 * artifitial wrapper to represent All Entries item in group list
 */
export class AllItemsGroupState extends KdbxItemState {

  private hiddenEntry: KdbxGroup;
  private hiddenIsSelected: boolean = false;
  protected get _entry(): KdbxEntry | KdbxGroup {
    return this.hiddenEntry;
  }

  constructor(isSelected?: boolean) {
    super(GlobalContext.allItemsGroupUuid)
    const allItemsGroup = new KdbxGroup();
    allItemsGroup.uuid = GlobalContext.allItemsGroupUuid;
    allItemsGroup.name = 'All Entries';
    this.hiddenEntry = allItemsGroup;
    this.hiddenIsSelected = isSelected || false;
  }


  clone(): AllItemsGroupState {
    let item = new AllItemsGroupState();
    item.hiddenIsSelected = this.hiddenIsSelected;
    return item;
  }

  get isSelected(): boolean { return this.hiddenIsSelected }

  setSelected(isSelected: boolean): AllItemsGroupState {
    const item = this.clone();
    item.hiddenIsSelected = isSelected;
    return item;
  }

    /** Always false */
  get isRecycled(): boolean { return false; }

}
