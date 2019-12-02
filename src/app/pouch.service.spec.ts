import { TestBed, inject, async } from '@angular/core/testing';
import { PouchService } from './pouch.service';

describe("Provider: PouchService", () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [],
      providers: [PouchService],
    }).compileComponents();
  }));

  it('should be created', () => {
    //Arrange
    const service: PouchService = TestBed.get(PouchService);
    //Act
    //Assert
    expect(service).toBeTruthy();
  });

  it('should grab posters from pouchDB',()=> {
      //Arrange
      const service: PouchService = TestBed.get(PouchService);
      //Act
      service.getAllPosters();
      //Assert
    expect(service.pouchPosters).toBeTruthy();
});

it('should update judges', () => {
  //Arrange
  const service: PouchService = TestBed.get(PouchService);
  //Act
    service.getAllJudgesPromise();
  //Assert
  expect(service.pouchJudges).toBeTruthy();
});

it('should grab specific poster', () => {
  //Arrange
  const service: PouchService = TestBed.get(PouchService);
  //Act
  service.getAllPosters();
   var result = service.getPoster('');
  //Assert
  expect(result).toEqual(({}));
});

it('should filter items', () => {
  //Arrange
  const service: PouchService = TestBed.get(PouchService);
  var spy = spyOn(service, 'filterItems');
  //Act
  service.getAllPosters();
   service.filterItems('');
  //Assert
  expect(service.posters).toBeTruthy();
  expect(spy).toHaveBeenCalled();
});


});
