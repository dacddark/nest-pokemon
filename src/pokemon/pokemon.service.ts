import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemones } from './entities/pokemon.entity';

@Injectable()
export class PokemonService {

  constructor(

    @InjectModel(Pokemones.name)
    private readonly pokemonModel : Model<Pokemones>,

  ){}


  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();


    try {
      const pokemon = await this.pokemonModel.create( createPokemonDto );
      return pokemon;
    
    } catch (error) {
      this.handleExceptions(error);
    }
    
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(id: string) {
    
    let pokemon : Pokemones;

    if( !isNaN (+id)){
      pokemon = await this.pokemonModel.findOne({no:id})
    }

    if(!pokemon && isValidObjectId ( id)){
      pokemon = await this.pokemonModel.findById( id );
    }

    if( !pokemon) {
      pokemon = await this.pokemonModel.findOne({ name : id.toLowerCase().trim()})
    }


    if(!pokemon) throw new NotFoundException(`Elemento con ID , nombre o termino "${ id }" no encontrado`)

    return pokemon;
  }

  async update(termino: string, updatePokemonDto: UpdatePokemonDto) {
    
    const pokemon = await this.findOne( termino) 

    if( updatePokemonDto.name)
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();

    try {
      await pokemon.updateOne( updatePokemonDto);
      return { ...pokemon.toJSON(), ...updatePokemonDto};

    } catch (error) {
      this.handleExceptions(error);
    }
     
  }

  async remove(id: string) {
    /* const pokemon = await this.findOne(id);
    await pokemon.deleteOne(); */
    //const result = await this.pokemonModel.findByIdAndDelete( id);

    const {deletedCount} = await this.pokemonModel.deleteOne({_id: id});

    if( deletedCount === 0)
      throw new BadRequestException(`Elemento con id "${id}" no encontrado`)

    return ;
  }


  private handleExceptions(error : any){
    if ( error.code === 11000){
      throw new BadRequestException(`Elemento ya existe en BD ${ JSON.stringify( error.keyValue)}`)
    }
    console.log(error);
    throw new InternalServerErrorException(`No se puede crear elemento -- Consultando Servidor`)
  }
}
