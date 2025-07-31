import {ChangeDetectorRef, Component, computed, inject, NgZone, OnInit, Signal} from '@angular/core';
import {entityStorage} from "../../../_helpers/storage/entityStorage";
import {Ingredient} from "../../../models/Positions/Ingredient";
import {Category} from "../../../models/Positions/Category";
import {HotToastService} from "@ngxpert/hot-toast";
import {IngredientsService} from "../../../_services/ingredients.service";
import {PositionsListItemComponent} from "../../positions-components/positions-list-item/positions-list-item.component";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatTree, MatTreeNode, MatTreeNodeDef, MatTreeNodePadding, MatTreeNodeToggle} from "@angular/material/tree";
import {MatButton, MatFabButton, MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {ExceptionMessage, isMessage} from "../../../models/Exceptions/ExceptionMessage";
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {MatDialog} from "@angular/material/dialog";
import {AddCategoryDialogueComponent} from "../add-category-dialogue/add-category-dialogue.component";
import {AddIngredientDialogueComponent} from "../add-ingredient-dialogue/add-ingredient-dialogue.component";
import {Router} from "@angular/router";
import {NgClass} from "@angular/common";
import {DeleteIngredientDialogueComponent} from "../delete-ingredient-dialogue/delete-ingredient-dialogue.component";
import {
  DeleteIngCategoryDialogueComponent
} from "../delete-ing-category-dialogue/delete-ing-category-dialogue.component";


@Component({
  selector: 'app-ingredients-list',
  imports: [
    MatProgressSpinner,

    MatTree,
    MatTreeNode,
    MatTreeNodeDef,
    MatTreeNodePadding,
    MatIconButton,
    MatTreeNodeToggle,
    MatIcon,
    MatButton,
    MatMenu,
    MatMenuItem,
    MatFabButton,
    MatMenuTrigger,
  ],
  templateUrl: './ingredients-list.component.html',
  styleUrl: './ingredients-list.component.css',

})
export class IngredientsListComponent implements OnInit {
  private store = inject(entityStorage);
  public ingredients: Signal<Ingredient[]> = computed(this.store.ingredientsEntities);
  public categories: Signal<Category[]> = computed(this.store.ingCategoriesEntities);

  childrenAccessor = (node: TreeNode) => node.children ?? [];
  hasChild = (_: number, node: TreeNode) => !!node.children?.length;
  treeData: TreeNode[] = [];
  prevName: string = "";



  readonly dialogue = inject(MatDialog);

  constructor(private toast: HotToastService,
              private ingService: IngredientsService,
              private router: Router,) {
  }

  ngOnInit(): void {
    if (this.ingredients().length == 0) {
      console.log("No ingredients found.");
      this.ingService.getAll().subscribe({
        next: data => {
          this.treeData = this.categoriesTree();
        },
        error: error => {
          this.toast.show(error.message, {duration: 3000, position: "bottom-center", autoClose: true});
        }
      })
    } else {
      this.treeData = this.categoriesTree();
    }

    if (this.categories().length == 0) {
      console.log("No categories found.");
      this.ingService.getAllCategories().subscribe({
        next: data => {
          this.treeData = this.categoriesTree();
        },
        error: error => {
          this.toast.show(error.message, {duration: 3000, position: "bottom-center", autoClose: true});
        }
      })
    } else {
      this.treeData = this.categoriesTree();
    }

  }

  categoriesTree(): TreeNode[] {
    return this.categories().map(category => {
      const children: TreeNode[] = this.ingredients()
        .filter(ing => ing.category.id === category.id)
        .map(ing => ({
          name: ing.name,
          id: ing.id,
          isParent: false
        }));

      return {
        name: category.name,
        id: category.id,
        isParent: true,
        children: children.length ? children : undefined
      };
    });
  }

  renameCategory(id: number, event: any) {
    let name = event.target.value
    if (name) {
      this.toggleEdit(event, String(id));
      this.ingService.renameCategory(id, name).subscribe({
        next: data => {
          if (!isMessage(data)) {
            event.target.value = data as String;
            this.toast.show("Збережено", {duration: 3000, position: "bottom-center", autoClose: true});
          }
        },
        error: error => {
          event.target.value = this.prevName;
          this.toast.show(error.message, {duration: 3000, position: "bottom-center", autoClose: true});
        }
      });
    }

  }

  removeCategory(id: number,name:string, event: any) {
    event.stopPropagation();
    const dialogue = this.dialogue.open(DeleteIngCategoryDialogueComponent,{
      data: { id:id, name:name }
    });

    dialogue.afterClosed().subscribe({
      next: data => {
        if(data){
          this.removeCategoryFromTree(id);
        }
      }
    })
    // this.ingService.removeCategory(id).subscribe({
    //   next: data => {
    //     if(data){
    //       this.toast.show("Видалено", {duration: 3000, position: "bottom-center", autoClose: true});
    //       this.removeCategoryFromTree(id);
    //     }
    //   },
    //   error: error => {
    //     this.toast.show(error.message, {duration: 3000, position: "bottom-center", autoClose: true});
    //   }
    // })
  }

  renameIngredient(id: number, event: any) {
    let name = event.target.value
    if (name) {
      this.toggleEdit(event, String(id));
      this.ingService.renameIngredient(id, name).subscribe({
        next: data => {
          if (!isMessage(data)) {
            event.target.value = data as String;
            this.toast.show("Збережено", {duration: 3000, position: "bottom-center", autoClose: true});
          }
        },
        error: error => {
          event.target.value = this.prevName;
          this.toast.show(error.message, {duration: 3000, position: "bottom-center", autoClose: true});
        }
      });
    }

  }

  removeIngredient(id: number,name:string, event: any) {
    event.stopPropagation();

    const diaogRef = this.dialogue.open(DeleteIngredientDialogueComponent,{
      data:{id:id,name:name},
      width:"40%",
    });
    diaogRef.afterClosed().subscribe({
      next: data => {
        if (data){
          this.removeIngredientFromTree(id);
        }
      }
    })

    // this.ingService.removeIngredient(id).subscribe({
    //   next: data => {
    //     if (!isMessage(data)) {
    //       this.removeIngredientFromTree(id);
    //       this.toast.show("Видалено", {duration: 3000, position: "bottom-center", autoClose: true});
    //     }
    //   },
    //   error: error => {
    //     this.toast.show(error.message, {duration: 3000, position: "bottom-center", autoClose: true});
    //   }
    // })
  }

  private removeIngredientFromTree(id: number) {
    for (let i = 0; i < this.treeData.length; i++) {
      if(!this.treeData[i].children)
        continue;
      let index = this.treeData[i].children!.findIndex(child => child.id === id);
      if(index!==-1) {
        this.treeData[i].children!.splice(index, 1);
      }
    }
    this.treeData = [...this.treeData];
  }


  savePrev(event: any) {
    this.prevName = event.target.value;
  }

  toggleEdit(event: any, id: string) {
    this.stopPropagination(event);
    let elem = document.getElementById(id);
    if (elem) {
      elem.toggleAttribute("readonly");
      elem.classList.toggle("disabled");
      elem.focus();
    }
  }

  stopPropagination(event: any) {
    event.preventDefault();
    event.stopPropagation();
  }

  openDialogueCategory() {
    const dialogueRef = this.dialogue.open(AddCategoryDialogueComponent, {
      data: {name: ''}
    });

    dialogueRef.afterClosed().subscribe({
      next: data => {
        if (data != undefined) {
          this.addCategory(data);
        }
      }
    })
  }

  openDialogueIngredient() {
    const dialogueRef = this.dialogue.open(AddIngredientDialogueComponent, {
      data: {
        name: '',
        categories: this.categories(),
        selectedCategory: null
      }
    });

    dialogueRef.afterClosed().subscribe({
      next: data => {
        if (data != undefined) {
          this.addIngredientToTree(data);
        }
      }
    })
  }

  private addCategory(name: string) {
    this.ingService.addCategory(name).subscribe({
      next: data => {
        if (data != undefined) {
          this.toast.show("Категорію " + data.name + " додано!",
            {duration: 3000, position: "bottom-center", autoClose: true});
          this.addCategoryToTree(data);
        } else {
          console.log(data)
        }
      },
      error: error => {
        this.toast.show(error.message, {duration: 3000, position: "bottom-center", autoClose: true});
      }
    })
  }

  private addCategoryToTree(data: Category) {
    console.log(this.treeData);

    this.treeData.push({
      name: data.name,
      id: data.id,
      isParent: true
    });

    this.treeData = [...this.treeData];
    console.log(this.treeData);
  }

  private addIngredientToTree(ing: Ingredient) {
    const parentNode = this.treeData.find(n => n.id === ing.category.id);
    if (!parentNode) return;

    const newChild: TreeNode = {
      id: ing.id,
      name: ing.name,
      isParent: false,
      children: []
    };

    if (!parentNode.children) {
      parentNode.children = [newChild];
      window.location.reload();
    } else {
      parentNode.children = [...parentNode.children, newChild]; // Force detection
    }

    this.treeData = [...this.treeData];

  }

  private removeCategoryFromTree(id: number) {
    let data = this.treeData.filter(x=>x.id!==id);
    this.treeData = [...data];
  }


}

interface TreeNode {
  name: string;
  id:number;
  isParent:boolean;
  children?:TreeNode[];
}
